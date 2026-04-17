"use client";

import type { PipelineStage } from "@/lib/types";

interface PipelineStepperProps {
  stages: PipelineStage[];
}

const STAGE_CONFIG: Record<string, { label: string; icon: string }> = {
  yolo: { label: "YOLO Detection", icon: "frame_inspect" },
  eigencam: { label: "EigenCAM Heatmap", icon: "gradient" },
  vlm: { label: "VLM Diagnosis", icon: "psychology" },
};

export default function PipelineStepper({ stages }: PipelineStepperProps) {
  const allPending = stages.every((s) => s.status === "pending");
  if (allPending) return null;

  return (
    <div className="flex justify-center py-3 bg-surface-low border-b border-surface-variant">
      <div className="flex items-center gap-3">
        {stages.map((stage, i) => {
          const config = STAGE_CONFIG[stage.stage] || { label: stage.stage, icon: "circle" };
          const isDone = stage.status === "done";
          const isRunning = stage.status === "running";

          return (
            <div key={stage.stage} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone
                      ? "bg-primary text-on-primary"
                      : isRunning
                        ? "bg-primary/20 text-primary step-active border-2 border-primary"
                        : "bg-surface-ctr text-on-surface-variant"
                    }`}
                >
                  {isDone ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">{config.icon}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${isDone ? "text-primary" : isRunning ? "text-primary" : "text-on-surface-variant"
                    }`}
                >
                  {config.label}
                </span>
              </div>

              {i < stages.length - 1 && (
                <div
                  className={`w-8 h-0.5 rounded-full transition-all ${isDone ? "bg-primary" : "bg-surface-variant"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
