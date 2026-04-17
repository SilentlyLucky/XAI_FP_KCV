import json
import os
from typing import Any

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__),"..", ".."))
JSONL_PATH = os.path.join(BASE_DIR, "backend", "vlm_dataset", "vlm_dataset_v2.jsonl")
PREDICTIONS_PATH = os.path.join(
    BASE_DIR, "backend", "qwen_vlm_qdora_v2", "per_sample_predictions.json"
)
SPLIT_INFO_PATH = os.path.join(
    BASE_DIR, "backend", "qwen_vlm_qdora_v2", "split_info.json"
)


print(f"[DataStore] Initialized with PREDICTIONS_PATH: {PREDICTIONS_PATH}")
print(f"[DataStore] Initialized with SPLIT_INFO_PATH: {SPLIT_INFO_PATH}")
print(f"[DataStore] BASE_DIR: {BASE_DIR}")

class DataStore:

    def __init__(self):
        self.image_objects: dict[str, list[dict[str, Any]]] = {}
        self.image_stats: dict[str, dict[str, Any]] = {}
        self.image_heatmaps: dict[str, dict[str, Any]] = {}
        self.vlm_predictions: dict[str, dict[str, Any]] = {}
        self.image_ids: list[str] = []
        self.test_image_ids: list[str] = []
        self.total_images = 0
        self.total_objects = 0

    def load(self):
        self._load_jsonl()
        self._load_predictions()
        self._load_split_info()
        print(
            f"[DataStore] Loaded {self.total_objects} objects across "
            f"{self.total_images} images, "
            f"{len(self.vlm_predictions)} VLM predictions, "
            f"{len(self.test_image_ids)} test images for shuffle"
        )

    def _load_jsonl(self):
        if not os.path.exists(JSONL_PATH):
            print(f"[DataStore] WARNING: JSONL not found at {JSONL_PATH}")
            return

        raw_entries: list[dict] = []
        with open(JSONL_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                entry = json.loads(line)
                raw_entries.append(entry)

        for entry in raw_entries:
            panel_name = entry.get("image", "")
            image_id = panel_name.replace("_3panel.jpg", "")
            if not image_id:
                continue

            input_data = entry.get("input", "{}")
            if isinstance(input_data, str):
                try:
                    input_data = json.loads(input_data)
                except json.JSONDecodeError:
                    input_data = {}

            obj = {
                "object_class": input_data.get("object_class", "unknown"),
                "object_type": input_data.get("object_type", "TP"),
                "risk_tier": input_data.get("risk_tier", "LOW"),
                "bbox": input_data.get("bbox", [0, 0, 0, 0]),
                "confidence": input_data.get("confidence"),
                "iou": input_data.get("iou"),
                "xai_metrics": input_data.get("xai_metrics", {}),
                "image_level": input_data.get("image_level", {}),
                "instruction": entry.get("instruction", ""),
                "ground_truth": entry.get("output", ""),
                "style": entry.get("style", "narrative"),
                "panel_image": panel_name,
            }

            if image_id not in self.image_objects:
                self.image_objects[image_id] = []
            self.image_objects[image_id].append(obj)

        for image_id, objects in self.image_objects.items():
            tp = sum(1 for o in objects if o["object_type"] == "TP")
            fp = sum(1 for o in objects if o["object_type"] == "FP")
            fn = sum(1 for o in objects if o["object_type"] == "FN")
            total = tp + fp + fn
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (
                2 * precision * recall / (precision + recall)
                if (precision + recall) > 0
                else 0.0
            )

            self.image_stats[image_id] = {
                "image_id": image_id,
                "tp_count": tp,
                "fp_count": fp,
                "fn_count": fn,
                "total_objects": total,
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1_score": round(f1, 4),
            }

        self.image_ids = sorted(self.image_objects.keys())
        self.total_images = len(self.image_ids)
        self.total_objects = sum(len(v) for v in self.image_objects.values())

    def _load_split_info(self):
        if not os.path.exists(SPLIT_INFO_PATH):
            print(f"[DataStore] WARNING: split_info.json not found, using all images")
            self.test_image_ids = self.image_ids[:]
            return

        try:
            with open(SPLIT_INFO_PATH, "r", encoding="utf-8") as f:
                split_data = json.load(f)
        except (json.JSONDecodeError, Exception) as e:
            print(f"[DataStore] WARNING: Failed to parse split_info.json: {e}")
            self.test_image_ids = self.image_ids[:]
            return

        test_panels = split_data.get("test_images", [])
        test_ids = set(
            p.replace("_3panel.jpg", "") for p in test_panels
        )
        self.test_image_ids = sorted(
            img_id for img_id in self.image_ids if img_id in test_ids
        )

        if not self.test_image_ids:
            print("[DataStore] WARNING: No test images matched, falling back to all")
            self.test_image_ids = self.image_ids[:]

    def _load_predictions(self):
        if not os.path.exists(PREDICTIONS_PATH):
            print(f"[DataStore] WARNING: Predictions not found at {PREDICTIONS_PATH}")
            return

        with open(PREDICTIONS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        predictions = data.get("predictions", [])
        for pred in predictions:
            panel_name = pred.get("image", "")
            self.vlm_predictions[panel_name] = pred

    def get_image_data(self, image_id: str) -> dict[str, Any] | None:
        if image_id not in self.image_objects:
            return None

        return {
            "image_id": image_id,
            "stats": self.image_stats.get(image_id, {}),
            "objects": self.image_objects[image_id],
        }

    def get_vlm_prediction(self, image_id: str, object_idx: int) -> dict[str, Any] | None:
        objects = self.image_objects.get(image_id, [])
        if object_idx < 0 or object_idx >= len(objects):
            return None

        obj = objects[object_idx]
        panel_name = obj.get("panel_image", "")

        if panel_name in self.vlm_predictions:
            pred = self.vlm_predictions[panel_name]
            if (
                pred.get("object_class") == obj["object_class"]
                and pred.get("object_type") == obj["object_type"]
            ):
                return {
                    "prediction": pred.get("prediction", ""),
                    "reference": pred.get("reference", ""),
                    "rouge1": pred.get("rouge1"),
                    "rouge2": pred.get("rouge2"),
                    "rougeL": pred.get("rougeL"),
                    "bleu": pred.get("bleu"),
                    "bert_score_f1": pred.get("bert_score_f1"),
                }

        return {
            "prediction": obj.get("ground_truth", "No VLM prediction available."),
            "reference": obj.get("ground_truth", ""),
            "rouge1": None,
            "rouge2": None,
            "rougeL": None,
            "bleu": None,
            "bert_score_f1": None,
            "is_ground_truth": True,
        }


data_store = DataStore()
