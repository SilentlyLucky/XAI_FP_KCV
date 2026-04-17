import numpy as np
import os
    
RISK_TIERS = {
    'pedestrian': 'CRITICAL', 'cyclist': 'CRITICAL', 'dog': 'CRITICAL',
    'stroller': 'CRITICAL', 'car': 'HIGH', 'truck': 'HIGH', 'bus': 'HIGH',
    'motorcycle': 'HIGH', 'moped': 'HIGH', 'tricycle': 'HIGH',
    'bicycle': 'HIGH', 'construction_vehicle': 'HIGH', 'cart': 'MODERATE',
    'barrier': 'MODERATE', 'bollard': 'MODERATE', 'traffic_cone': 'MODERATE',
    'traffic_island': 'MODERATE', 'traffic_light': 'MODERATE',
    'traffic_sign': 'MODERATE', 'sentry_box': 'LOW', 'debris': 'LOW',
    'suitcace': 'LOW', 'dustbin': 'LOW', 'concrete_block': 'LOW',
    'machinery': 'LOW', 'garbage': 'LOW', 'plastic_bag': 'LOW',
    'stone': 'LOW', 'misc': 'LOW',
}

COCO_TO_GT_MAP = {
    'person': 'pedestrian', 'bicycle': 'bicycle', 'car': 'car',
    'motorcycle': 'motorcycle', 'bus': 'bus', 'truck': 'truck',
    'dog': 'dog', 'traffic light': 'traffic_light',
    'stop sign': 'traffic_sign', 'fire hydrant': 'bollard',
    'backpack': 'suitcace', 'suitcase': 'suitcace',
}

import os

def load_yolo_gt(label_path, img_w, img_h, class_names=None):
    if class_names is None: class_names = {}
    boxes = []
    if not os.path.exists(label_path): return boxes
    with open(label_path, 'r') as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) < 5: continue
            cls_id = int(parts[0])
            cx, cy, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
            x1 = max(0, int((cx - w/2) * img_w))
            y1 = max(0, int((cy - h/2) * img_h))
            x2 = min(img_w, int((cx + w/2) * img_w))
            y2 = min(img_h, int((cy + h/2) * img_h))
            class_name = class_names.get(cls_id, str(cls_id))
            boxes.append({'class_id': cls_id, 'class_name': class_name, 'bbox_xywh': [x1, y1, x2-x1, y2-y1], 'bbox_xyxy': [x1, y1, x2, y2]})
    return boxes

def compute_iou(b1, b2):
    x1, y1 = max(b1[0], b2[0]), max(b1[1], b2[1])
    x2, y2 = min(b1[2], b2[2]), min(b1[3], b2[3])
    inter = max(0, x2-x1) * max(0, y2-y1)
    a1 = max(0, (b1[2]-b1[0]) * (b1[3]-b1[1]))
    a2 = max(0, (b2[2]-b2[0]) * (b2[3]-b2[1]))
    return inter / (a1 + a2 - inter + 1e-8)

def match_preds_to_gt(preds, gt_boxes, iou_thresh=0.3):
    tp, fp, fn = [], [], []
    gt_matched = [False] * len(gt_boxes)
    pred_matched = [False] * len(preds)
    iou_matrix = np.zeros((len(preds), len(gt_boxes)))
    
    for i, p in enumerate(preds):
        for j, g in enumerate(gt_boxes):
            iou_matrix[i, j] = compute_iou(p['bbox_xyxy'], g['bbox_xyxy'])
            
    while True:
        max_iou = iou_matrix.max() if iou_matrix.size > 0 else 0
        if max_iou < iou_thresh: break
        
        i, j = np.unravel_index(iou_matrix.argmax(), iou_matrix.shape)
        p_cls = preds[i].get('class_name', '')
        g_cls = gt_boxes[j].get('class_name', 'unknown')
        
        if p_cls == g_cls:
            tp.append({'pred': preds[i], 'gt': {**gt_boxes[j], 'class_name': g_cls}, 'iou': float(max_iou)})
            pred_matched[i] = True; gt_matched[j] = True
        else:
            fp.append({'pred': preds[i], 'gt': {**gt_boxes[j], 'class_name': g_cls}, 'iou': float(max_iou), 'reason': f'Pred {p_cls}, GT {g_cls}'})
            pred_matched[i] = True
            
        iou_matrix[i, :] = 0; iou_matrix[:, j] = 0
        
    for i, p in enumerate(preds):
        if not pred_matched[i]: 
            fp.append({'pred': p, 'gt': None, 'iou': 0.0, 'reason': f'No GT for {p.get("class_name")}'})
            
    for j, g in enumerate(gt_boxes):
        if not gt_matched[j]:
            g_cls = g.get('class_name', 'unknown')
            fn.append({'pred': None, 'gt': {**g, 'class_name': g_cls}, 'risk_tier': RISK_TIERS.get(g_cls, 'LOW')})
            
    return tp, fp, fn

def compute_xai_metrics_per_object(heatmap, bbox_xywh):
    x, y, w, h = map(int, bbox_xywh)
    h_img, w_img = heatmap.shape
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(w_img, x + w), min(h_img, y + h)

    if x2 <= x1 or y2 <= y1:
        return {k: 0.0 for k in ['focus_score', 'background_leakage', 'attention_iou', 'pointing_game', 'ebpg', 'entropy', 'sparsity', 'peak_intensity_ratio', 'attention_mean', 'attention_max', 'spurious_correlation_index', 'attention_concentration']}

    bbox_mask = np.zeros_like(heatmap, dtype=bool)
    bbox_mask[y1:y2, x1:x2] = True
    hm_inside, hm_outside = heatmap[bbox_mask], heatmap[~bbox_mask]
    total_energy, mean_total = np.sum(heatmap) + 1e-8, np.mean(heatmap) + 1e-8

    focus_score = float(np.mean(hm_inside) / mean_total) if hm_inside.size > 0 else 0.0
    bg_leakage = float(np.sum(hm_outside) / total_energy) if hm_outside.size > 0 else 0.0

    high_attn = heatmap > 0.5
    attention_iou = float(np.logical_and(high_attn, bbox_mask).sum() / (np.logical_or(high_attn, bbox_mask).sum() + 1e-8))
    max_pos = np.unravel_index(np.argmax(heatmap), heatmap.shape)
    pointing_game = 1.0 if bbox_mask[max_pos[0], max_pos[1]] else 0.0
    ebpg = float(np.sum(hm_inside) / total_energy) if hm_inside.size > 0 else 0.0

    hist, _ = np.histogram(heatmap, bins=256, range=(0, 1), density=True)
    p = hist[hist > 0]; p = p / (p.sum() + 1e-8)
    entropy = float(-np.sum(p * np.log2(p + 1e-8)))
    sparsity = float(np.mean(heatmap < 0.1))
    peak_intensity = float(np.max(heatmap) / (np.mean(heatmap) + 1e-8))
    attention_mean = float(np.mean(hm_inside)) if hm_inside.size > 0 else 0.0
    attention_max = float(np.max(hm_inside)) if hm_inside.size > 0 else 0.0
    spurious_idx = float(bg_leakage * (1.0 - focus_score / (focus_score + 1.0)))

    sorted_vals = np.sort(heatmap.ravel())[::-1]
    top_10 = int(len(sorted_vals) * 0.1)
    concentration = float(np.sum(sorted_vals[:top_10]) / total_energy) if top_10 > 0 else 0.0

    return {
        'focus_score': round(focus_score, 4), 
        'background_leakage': round(bg_leakage, 4), 
        'attention_iou': round(attention_iou, 4), 
        'pointing_game': pointing_game, 
        'ebpg': round(ebpg, 4), 
        'entropy': round(entropy, 4), 
        'sparsity': round(sparsity, 4), 
        'peak_intensity_ratio': round(peak_intensity, 4), 
        'attention_mean': round(attention_mean, 4), 
        'attention_max': round(attention_max, 4), 
        'spurious_correlation_index': round(spurious_idx, 4), 
        'attention_concentration': round(concentration, 4)
    }

def compute_global_xai_metrics(heatmap):
    total_energy = np.sum(heatmap) + 1e-8
    hist, _ = np.histogram(heatmap, bins=256, range=(0, 1), density=True)
    p = hist[hist > 0]; p = p / (p.sum() + 1e-8)
    top_10 = int(len(heatmap.ravel()) * 0.1)
    return {
        'global_entropy': round(float(-np.sum(p * np.log2(p + 1e-8))), 4), 
        'global_sparsity': round(float(np.mean(heatmap < 0.1)), 4), 
        'global_mean_activation': round(float(np.mean(heatmap)), 4), 
        'global_max_activation': round(float(np.max(heatmap)), 4), 
        'global_peak_ratio': round(float(np.max(heatmap) / (np.mean(heatmap) + 1e-8)), 4), 
        'global_concentration': round(float(np.sum(np.sort(heatmap.ravel())[::-1][:top_10]) / total_energy), 4)
    }
