export interface XAIMetrics {
  focus_score: number;
  background_leakage: number;
  attention_iou: number;
  pointing_game: number;
  ebpg: number;
  entropy: number;
  sparsity: number;
  peak_intensity_ratio: number;
  attention_mean: number;
  attention_max: number;
  spurious_correlation_index: number;
  attention_concentration: number;
}

export interface DetectedObject {
  object_class: string;
  object_type: "TP" | "FP" | "FN";
  gt_class?: string;
  risk_tier: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  bbox: [number, number, number, number];
  confidence: number | null;
  iou: number | null;
  xai_metrics: XAIMetrics;
  image_level: {
    tp_count: number;
    fp_count: number;
    fn_count: number;
    precision: number;
    recall: number;
  };
  instruction: string;
  ground_truth: string;
  style: string;
  panel_image: string;
}

export interface ImageStats {
  image_id: string;
  tp_count: number;
  fp_count: number;
  fn_count: number;
  total_objects: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export interface ImageData {
  image_id: string;
  stats: ImageStats;
  objects: DetectedObject[];
}

export interface PipelineStage {
  stage: "yolo" | "eigencam" | "vlm" | "complete";
  status: "pending" | "running" | "done";
  message?: string;
}

export interface DiagnosisMeta {
  is_ground_truth: boolean;
  rouge1: number | null;
  bert_score_f1: number | null;
}

export type ViewMode = "rgb" | "bbox" | "heatmap";
