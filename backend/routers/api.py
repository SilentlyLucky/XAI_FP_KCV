import asyncio
import json
import random
import time

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response, StreamingResponse

from services.data_loader import data_store
from services.image_service import (
    crop_heatmap,
    crop_original_from_panel,
    get_panel_image_path,
    get_raw_image_path,
)

router = APIRouter(prefix="/api")


@router.get("/images")
async def list_images(limit: int = Query(50, ge=1, le=977)):
    ids = data_store.image_ids[:limit]
    results = []
    for image_id in ids:
        stats = data_store.image_stats.get(image_id, {})
        results.append(
            {
                "image_id": image_id,
                "tp_count": stats.get("tp_count", 0),
                "fp_count": stats.get("fp_count", 0),
                "fn_count": stats.get("fn_count", 0),
                "total_objects": stats.get("total_objects", 0),
            }
        )
    return {
        "total_available": data_store.total_images,
        "returned": len(results),
        "images": results,
    }


@router.get("/generate")
async def generate_pipeline():
    async def event_stream():
        image_id = random.choice(data_store.test_image_ids)
        stats = data_store.image_stats.get(image_id, {})

        try:
            from services.model_loader import MODELS_ENABLED, model_loader
        except ImportError:
            MODELS_ENABLED = False

        if MODELS_ENABLED:
            import os
            from PIL import Image
            import numpy as np
            from services.xai_metrics import (
                load_yolo_gt, match_preds_to_gt, compute_xai_metrics_per_object, compute_global_xai_metrics, COCO_TO_GT_MAP, RISK_TIERS
            )

            yield f"data: {json.dumps({'stage': 'yolo', 'status': 'running', 'message': 'Running live YOLOv11s detection...'})}\n\n"
            raw_path = get_raw_image_path(image_id)
            if not raw_path:
                yield f"data: {json.dumps({'stage': 'yolo', 'status': 'done'})}\n\n"
            else:
                img_pil = Image.open(raw_path).convert("RGB")
                img_w, img_h = img_pil.size
                
                yolo_results = await asyncio.to_thread(model_loader.run_yolo_detection, img_pil)
                yield f"data: {json.dumps({'stage': 'yolo', 'status': 'done'})}\n\n"
                
                yield f"data: {json.dumps({'stage': 'eigencam', 'status': 'running', 'message': 'Computing live XAI matrix metrics...'})}\n\n"
                
                class_names = model_loader.yolo.names if hasattr(model_loader.yolo, 'names') else {}

                preds = yolo_results["detections"]
                for p in preds:
                    x, y, x2, y2 = p["bbox"]
                    p["bbox_xywh"] = [x, y, x2-x, y2-y]
                    p["bbox_xyxy"] = [x, y, x2, y2]
                    p["class_name"] = COCO_TO_GT_MAP.get(p["class_name"], p["class_name"])

                label_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(raw_path))), "labels", "val", f"{image_id}.txt")
                gt_boxes = load_yolo_gt(label_path, img_w, img_h, class_names)
                
                for g in gt_boxes:
                    g["class_name"] = COCO_TO_GT_MAP.get(g["class_name"], g["class_name"])
                
                tp_list, fp_list, fn_list = match_preds_to_gt(preds, gt_boxes)
                raw_heatmap = yolo_results.get("raw_heatmap")
                global_metrics = compute_global_xai_metrics(raw_heatmap) if raw_heatmap is not None else {}
                
                if raw_heatmap is not None:
                    import cv2
                    from PIL import Image as PILImage
                    cam_image = (raw_heatmap * 255).astype(np.uint8)
                    heatmap_colored = cv2.applyColorMap(cam_image, cv2.COLORMAP_JET)
                    data_store.image_heatmaps[image_id] = PILImage.fromarray(cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB))
                else:
                    raw_heatmap = np.zeros((img_h, img_w))
                    
                global_metrics = compute_global_xai_metrics(raw_heatmap)
                all_objects = []
                for p in tp_list:
                    all_objects.append({
                        "object_class": p["pred"]["class_name"], "object_type": "TP",
                        "risk_tier": RISK_TIERS.get(p["pred"]["class_name"], "LOW"),
                        "bbox": p["pred"]["bbox_xywh"], "confidence": round(p["pred"]["confidence"], 4),
                        "iou": round(p["iou"], 4), "xai_metrics": compute_xai_metrics_per_object(raw_heatmap, p["pred"]["bbox_xywh"]),
                        "image_level": {"global_metrics": global_metrics}, "panel_image": f"{image_id}_3panel.jpg"
                    })
                for p in fp_list:
                    all_objects.append({
                        "object_class": p["pred"]["class_name"], "object_type": "FP",
                        "risk_tier": RISK_TIERS.get(p["pred"]["class_name"], "LOW"),
                        "bbox": p["pred"]["bbox_xywh"], "confidence": round(p["pred"]["confidence"], 4),
                        "iou": round(p["iou"], 4), "xai_metrics": compute_xai_metrics_per_object(raw_heatmap, p["pred"]["bbox_xywh"]),
                        "image_level": {"global_metrics": global_metrics}, "panel_image": f"{image_id}_3panel.jpg"
                    })
                for p in fn_list:
                    all_objects.append({
                        "object_class": p["gt"]["class_name"], "object_type": "FN",
                        "risk_tier": RISK_TIERS.get(p["gt"]["class_name"], "LOW"),
                        "bbox": p["gt"]["bbox_xywh"], "confidence": None, "iou": None,
                        "xai_metrics": compute_xai_metrics_per_object(raw_heatmap, p["gt"]["bbox_xywh"]),
                        "image_level": {"global_metrics": global_metrics}, "panel_image": f"{image_id}_3panel.jpg"
                    })
                    
                precision = len(tp_list) / (len(tp_list) + len(fp_list) + 1e-8)
                recall = len(tp_list) / (len(tp_list) + len(fn_list) + 1e-8)
                f1_score = 2 * precision * recall / (precision + recall + 1e-8)

                data_store.image_objects[image_id] = all_objects
                data_store.image_stats[image_id] = {
                    "image_id": image_id, "tp_count": len(tp_list), "fp_count": len(fp_list), "fn_count": len(fn_list),
                    "total_objects": len(all_objects), "precision": round(precision, 4),
                    "recall": round(recall, 4), "f1_score": round(f1_score, 4)
                }
                stats = data_store.image_stats[image_id]
                yield f"data: {json.dumps({'stage': 'eigencam', 'status': 'done'})}\n\n"
                
                yield f"data: {json.dumps({'stage': 'vlm', 'status': 'running', 'message': 'Preparing VLM diagnosis...'})}\n\n"
                await asyncio.sleep(0.4)
                yield f"data: {json.dumps({'stage': 'vlm', 'status': 'done'})}\n\n"
        else:
            stages = [
                ("yolo", "Running YOLOv11s detection...", 0.8),
                ("eigencam", "Generating EigenCAM heatmap...", 0.6),
                ("vlm", "Preparing VLM diagnosis...", 0.4),
            ]
            for stage_name, msg, delay in stages:
                yield f"data: {json.dumps({'stage': stage_name, 'status': 'running', 'message': msg})}\n\n"
                await asyncio.sleep(delay)
                yield f"data: {json.dumps({'stage': stage_name, 'status': 'done'})}\n\n"

        yield f"data: {json.dumps({'stage': 'complete', 'status': 'done', 'image_id': image_id, 'stats': stats})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/results/{image_id}")
async def get_results(image_id: str):
    data = data_store.get_image_data(image_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Image {image_id} not found")
    return data


@router.get("/diagnosis/{image_id}/{object_idx}")
async def stream_diagnosis(image_id: str, object_idx: int):
    prediction = data_store.get_vlm_prediction(image_id, object_idx)
    if not prediction:
        raise HTTPException(
            status_code=404, detail=f"No prediction for {image_id} object {object_idx}"
        )

    text = prediction.get("prediction", "") or prediction.get("reference", "")
    is_ground_truth = prediction.get("is_ground_truth", False)

    async def event_stream():
        try:
            from services.model_loader import MODELS_ENABLED, model_loader
        except ImportError:
            MODELS_ENABLED = False

        if MODELS_ENABLED:
            obj = data_store.image_objects.get(image_id, [])[object_idx]
            stats = data_store.image_stats.get(image_id, {})
            from services.prompt_builder import generate_random_prompt
            from services.image_service import get_panel_image_path
            from PIL import Image

            inst, prompt = generate_random_prompt(obj, stats)
            meta = {
                "type": "meta",
                "is_ground_truth": False,
                "rouge1": None,
                "bert_score_f1": None,
            }
            yield f"data: {json.dumps(meta)}\n\n"

            import os
            from PIL import Image, ImageDraw, ImageFont
            from services.image_service import get_raw_image_path
            
            raw_path = get_raw_image_path(image_id)
            if not raw_path:
                yield f"data: {json.dumps({'error': f'Raw image not found for {image_id}'})}\n\n"
                return

            pil_img = Image.open(raw_path).convert("RGB")
            heatmap_pil = data_store.image_heatmaps.get(image_id)

            if not heatmap_pil:
                panel_path = get_panel_image_path(image_id)
                if not panel_path:
                    yield f"data: {json.dumps({'error': f'Heatmap panel not precomputed for {image_id}'})}\n\n"
                    return
                panel_img = Image.open(panel_path).convert("RGB")
            else:
                w, h = pil_img.size
                panel_img = Image.new('RGB', (w * 3, h))
                panel_img.paste(pil_img, (0, 0))
                panel_img.paste(heatmap_pil.resize((w, h)), (w, 0))
                
                bbox_panel = pil_img.copy()
                draw = ImageDraw.Draw(bbox_panel)
                
                try:
                    font = ImageFont.truetype("arial.ttf", 14)
                except IOError:
                    font = ImageFont.load_default()
                    
                all_objs = data_store.image_objects.get(image_id, [])
                for o in all_objs:
                    bx, by, bw, bh = o.get('bbox', [0,0,0,0])
                    obj_type = o.get('object_type')
                    obj_class = o.get('object_class', '')
                    conf = o.get('confidence')
                    
                    if obj_type == 'TP':
                        color = "#4CAF50"
                        conf_str = f"{conf:.2f}" if conf is not None else ""
                        label = f"{obj_class} {conf_str}".strip()
                        text_color = "black"
                    elif obj_type == 'FP':
                        color = "#EF5350"
                        conf_str = f"{conf:.2f}" if conf is not None else ""
                        label = f"FP: {obj_class} {conf_str} (GT: none)".replace("  ", " ").strip()
                        text_color = "white"
                    else:
                        color = "#FFB74D"
                        label = f"FN: {obj_class} (Missed)"
                        text_color = "black"

                    draw.rectangle([bx, by, bx+bw, by+bh], outline=color, width=3)
                    
                    text_bbox = draw.textbbox((0, 0), label, font=font)
                    text_w = text_bbox[2] - text_bbox[0]
                    text_h = text_bbox[3] - text_bbox[1] + 4
                    
                    label_x = bx
                    label_y = max(0, by - 16)
                    
                    draw.rectangle([label_x, label_y, label_x + text_w + 4, label_y + 16], fill=color)
                    draw.text((label_x + 2, label_y + 1), label, fill=text_color, font=font)
                
                panel_img.paste(bbox_panel, (w*2, 0))
            
            yield f"data: {json.dumps({'type': 'section', 'section': 'Live Generator'})}\n\n"
            
            try:
                live_text = await asyncio.to_thread(
                    model_loader.generate_diagnosis,
                    panel_img,
                    inst,
                    prompt
                )
            except Exception as e:
                live_text = f"Live generation failed: {e}"

            words = live_text.split(" ")
            for i, word in enumerate(words):
                token = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"
                await asyncio.sleep(0.01)

            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            return


        meta = {
            "type": "meta",
            "is_ground_truth": is_ground_truth,
            "rouge1": prediction.get("rouge1"),
            "bert_score_f1": prediction.get("bert_score_f1"),
        }
        yield f"data: {json.dumps(meta)}\n\n"

        sections = _parse_sections(text)

        for section_name, section_text in sections:
            yield f"data: {json.dumps({'type': 'section', 'section': section_name})}\n\n"
            await asyncio.sleep(0.05)

            # Stream tokens (words)
            for i, word in enumerate(words):
                token = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"
                await asyncio.sleep(0.02)

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _parse_sections(text: str) -> list[tuple[str, str]]:
    import re

    section_pattern = re.compile(
        r"(OBSERVATION|EVIDENCE|DIAGNOSIS|VERDICT)\s*:\s*", re.IGNORECASE
    )
    matches = list(section_pattern.finditer(text))

    if len(matches) >= 2:
        sections = []
        for i, match in enumerate(matches):
            name = match.group(1).lower()
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            section_text = text[start:end].strip()
            if section_text:
                sections.append((name, section_text))
        return sections

    if text.strip().startswith("-") or text.strip().startswith("•"):
        return [("analysis", text.strip())]

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(paragraphs) == 1:
        return [("analysis", paragraphs[0])]

    section_names = ["observation", "analysis", "diagnosis", "verdict"]
    sections = []
    for i, para in enumerate(paragraphs):
        name = section_names[i] if i < len(section_names) else f"section_{i + 1}"
        sections.append((name, para))
    return sections


@router.get("/image/{image_id}")
async def serve_image(image_id: str):
    raw_path = get_raw_image_path(image_id)
    if raw_path:
        with open(raw_path, "rb") as f:
            content = f.read()
        media_type = "image/jpeg" if raw_path.endswith(".jpg") else "image/png"
        return Response(content=content, media_type=media_type)

    original_bytes = crop_original_from_panel(image_id)
    if original_bytes:
        return Response(content=original_bytes, media_type="image/jpeg")

    raise HTTPException(status_code=404, detail=f"Image {image_id} not found")


@router.get("/heatmap/{image_id}")
async def serve_heatmap(image_id: str):
    heatmap_bytes = crop_heatmap(image_id)
    if not heatmap_bytes:
        raise HTTPException(
            status_code=404, detail=f"Heatmap for {image_id} not found"
        )
    return Response(content=heatmap_bytes, media_type="image/jpeg")


@router.get("/panel/{image_id}")
async def serve_panel(image_id: str):
    panel_path = get_panel_image_path(image_id)
    if not panel_path:
        raise HTTPException(
            status_code=404, detail=f"Panel image for {image_id} not found"
        )
    with open(panel_path, "rb") as f:
        content = f.read()
    return Response(content=content, media_type="image/jpeg")


@router.get("/summary")
async def get_summary():
    total_tp = sum(s.get("tp_count", 0) for s in data_store.image_stats.values())
    total_fp = sum(s.get("fp_count", 0) for s in data_store.image_stats.values())
    total_fn = sum(s.get("fn_count", 0) for s in data_store.image_stats.values())

    precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0
    recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0

    return {
        "total_images": data_store.total_images,
        "total_objects": data_store.total_objects,
        "total_tp": total_tp,
        "total_fp": total_fp,
        "total_fn": total_fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "vlm_predictions_available": len(data_store.vlm_predictions),
    }
