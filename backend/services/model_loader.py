import io
import json
import os
import threading
from dataclasses import dataclass, field
from typing import Any

import numpy as np
from PIL import Image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
YOLO_WEIGHTS = os.path.join(BASE_DIR, "backend", "model", "yolov11s_best.pt")
ADAPTER_PATH = os.path.join(BASE_DIR, "backend", "qwen_vlm_qdora_v2", "lora_adapter")
BASE_MODEL_ID = "Qwen/Qwen2-VL-2B-Instruct"
IMAGE_SIZE = 384

MODELS_ENABLED = True


@dataclass
class ModelStatus:
    yolo_loaded: bool = False
    vlm_loaded: bool = False
    yolo_error: str | None = None
    vlm_error: str | None = None
    device: str = "cpu"


class ModelLoader:
    def __init__(self):
        self._yolo_model = None
        self._eigencam = None
        self._vlm_model = None
        self._vlm_processor = None
        self._lock = threading.Lock()
        self.status = ModelStatus()

    def _load_yolo(self):
        if self._yolo_model is not None:
            return

        with self._lock:
            if self._yolo_model is not None:
                return

            try:
                import torch
                from ultralytics import YOLO

                print(f"[ModelLoader] Loading YOLO from {YOLO_WEIGHTS}")
                model = YOLO(YOLO_WEIGHTS)

                device = "cuda" if torch.cuda.is_available() else "cpu"
                self.status.device = device
                print(f"[ModelLoader] YOLO device: {device}")
                
                model.to(device)

                self._yolo_model = model
                self.status.yolo_loaded = True
                print("[ModelLoader] YOLO loaded successfully")

                self._init_eigencam()

            except Exception as e:
                self.status.yolo_error = str(e)
                print(f"[ModelLoader] YOLO load failed: {e}")
                raise

    def _init_eigencam(self):
        try:
            import torch
            from pytorch_grad_cam import EigenCAM
            from pytorch_grad_cam.utils.model_targets import (
                ClassifierOutputTarget,
            )

            class YOLOWrapper(torch.nn.Module):
                def __init__(self, model):
                    super().__init__()
                    self.model = model

                def forward(self, x):
                    res = self.model(x)
                    if isinstance(res, tuple):
                        return res[0]
                    if isinstance(res, list):
                        return res[0]
                    return res

            backbone = self._yolo_model.model.model
            target_layer = backbone[9]

            self._eigencam = EigenCAM(
                model=YOLOWrapper(self._yolo_model.model),
                target_layers=[target_layer],
            )
            print("[ModelLoader] EigenCAM initialized")

        except ImportError:
            print(
                "[ModelLoader] WARNING: pytorch_grad_cam not installed, "
                "heatmaps will use fallback"
            )
            self._eigencam = None
        except Exception as e:
            print(f"[ModelLoader] WARNING: EigenCAM init failed: {e}")
            self._eigencam = None

    @property
    def yolo(self):
        if not MODELS_ENABLED:
            raise RuntimeError(
                "Model loading is disabled. Set LOAD_MODELS=1 to enable."
            )
        if self._yolo_model is None:
            self._load_yolo()
        return self._yolo_model

    def run_yolo_detection(self, image: Image.Image) -> dict[str, Any]:
        import base64
        import torch

        model = self.yolo

        results = model.predict(
            source=image,
            conf=0.25,
            iou=0.30,
            verbose=False,
        )

        detections = []
        if results and len(results) > 0:
            result = results[0]
            for box in result.boxes:
                detections.append(
                    {
                        "class_id": int(box.cls[0]),
                        "class_name": result.names[int(box.cls[0])],
                        "confidence": round(float(box.conf[0]), 4),
                        "bbox": [round(float(c), 2) for c in box.xyxy[0].tolist()],
                    }
                )

        heatmap_b64 = None
        raw_heatmap = None
        if self._eigencam is not None:
            try:
                img_np = np.array(image.resize((640, 640))) / 255.0
                img_tensor = (
                    torch.from_numpy(img_np)
                    .permute(2, 0, 1)
                    .unsqueeze(0)
                    .float()
                    .to(self.status.device)
                )
                cam = self._eigencam(img_tensor)
                cam_image = (cam[0, 0] * 255).astype(np.uint8)
                
                from PIL import Image as PILImage
                import cv2
                raw_heatmap = cv2.resize(cam[0, 0], image.size)

                heatmap_colored = cv2.applyColorMap(cam_image, cv2.COLORMAP_JET)
                heatmap_pil = PILImage.fromarray(
                    cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
                )

                buf = io.BytesIO()
                heatmap_pil.save(buf, format="PNG")
                heatmap_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

            except Exception as e:
                print(f"[ModelLoader] EigenCAM heatmap generation failed: {e}")

        return {
            "detections": detections,
            "heatmap_base64": heatmap_b64,
            "raw_heatmap": raw_heatmap,
        }

    def _load_vlm(self):
        if self._vlm_model is not None:
            return

        with self._lock:
            if self._vlm_model is not None:
                return

            try:
                import torch
                from peft import PeftModel
                from transformers import (
                    AutoProcessor,
                    BitsAndBytesConfig,
                    Qwen2VLForConditionalGeneration,
                )

                use_bf16 = (
                    torch.cuda.is_available() and torch.cuda.is_bf16_supported()
                )
                compute_dtype = torch.bfloat16 if use_bf16 else torch.float16
                device = "cuda" if torch.cuda.is_available() else "cpu"
                self.status.device = device

                print(f"[ModelLoader] Loading VLM base model: {BASE_MODEL_ID}")
                print(f"[ModelLoader] Compute dtype: {compute_dtype}, device: {device}")

                bnb_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_compute_dtype=compute_dtype,
                    bnb_4bit_use_double_quant=True,
                )

                base_model = Qwen2VLForConditionalGeneration.from_pretrained(
                    BASE_MODEL_ID,
                    quantization_config=bnb_config,
                    device_map={"": 0} if device == "cuda" else "cpu",
                    low_cpu_mem_usage=True,
                    torch_dtype=compute_dtype,
                    attn_implementation="sdpa",
                )

                print(f"[ModelLoader] Loading QDoRA adapter: {ADAPTER_PATH}")
                processor = AutoProcessor.from_pretrained(ADAPTER_PATH)
                model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
                model.eval()

                self._vlm_model = model
                self._vlm_processor = processor
                self.status.vlm_loaded = True
                print("[ModelLoader] VLM + QDoRA adapter loaded successfully")

            except Exception as e:
                import traceback
                self.status.vlm_error = str(e)
                print(f"[ModelLoader] VLM load failed:")
                traceback.print_exc()
                raise

    @property
    def vlm(self):
        if not MODELS_ENABLED:
            raise RuntimeError(
                "Model loading is disabled. Set LOAD_MODELS=1 to enable."
            )
        if self._vlm_model is None:
            self._load_vlm()
        return self._vlm_model

    @property
    def vlm_processor(self):
        if self._vlm_processor is None:
            self._load_vlm()
        return self._vlm_processor

    def generate_diagnosis(
        self,
        image: Image.Image,
        instruction: str,
        input_text: str,
        max_tokens: int = 512,
        temperature: float = 0.3,
    ) -> str:
        import torch
        from qwen_vl_utils import process_vision_info

        model = self.vlm
        processor = self.vlm_processor

        img = image.convert("RGB").resize((IMAGE_SIZE, IMAGE_SIZE))

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": img},
                    {"type": "text", "text": instruction + "\n" + input_text},
                ],
            }
        ]

        text = processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        image_inputs, video_inputs = process_vision_info(messages)
        inputs = processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
        )
        inputs = {k: v.to(model.device) for k, v in inputs.items()}

        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
            )

        result = processor.decode(
            output_ids[0][inputs["input_ids"].shape[1] :],
            skip_special_tokens=True,
        )
        return result

    def get_status(self) -> dict[str, Any]:
        return {
            "models_enabled": MODELS_ENABLED,
            "yolo": {
                "loaded": self.status.yolo_loaded,
                "weights": os.path.basename(YOLO_WEIGHTS),
                "weights_exist": os.path.exists(YOLO_WEIGHTS),
                "error": self.status.yolo_error,
            },
            "vlm": {
                "loaded": self.status.vlm_loaded,
                "base_model": BASE_MODEL_ID,
                "adapter_path": os.path.basename(ADAPTER_PATH),
                "adapter_exists": os.path.exists(
                    os.path.join(ADAPTER_PATH, "adapter_model.safetensors")
                ),
                "error": self.status.vlm_error,
            },
            "device": self.status.device,
        }

model_loader = ModelLoader()
