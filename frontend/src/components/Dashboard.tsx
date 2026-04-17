"use client";

import { useState } from "react";
import type { DetectedObject, XAIMetrics } from "@/lib/types";

interface DashboardProps {
  selectedObject: DetectedObject | null;
  diagnosisSections: Record<string, string>;
  currentSection: string;
  isDiagnosisDone: boolean;
  diagnosisMeta: {
    is_ground_truth: boolean;
    rouge1: number | null;
    bert_score_f1: number | null;
  } | null;
}

const SECTION_LABELS: Record<string, { label: string; color: string }> = {
  observation: { label: "Observation", color: "#2196F3" },
  evidence: { label: "Evidence", color: "#FF9800" },
  diagnosis: { label: "Diagnosis", color: "#E91E63" },
  verdict: { label: "Verdict", color: "#4CAF50" },
  analysis: { label: "Analysis", color: "#004B8D" },
};

const METRIC_CONFIG: { key: keyof XAIMetrics; label: string; max: number; invert?: boolean }[] = [
  { key: "focus_score", label: "Focus Score", max: 10 },
  { key: "background_leakage", label: "Background Leakage", max: 1, invert: true },
  { key: "attention_iou", label: "Attention IoU", max: 1 },
  { key: "pointing_game", label: "Pointing Game", max: 1 },
  { key: "ebpg", label: "EBPG", max: 1 },
  { key: "spurious_correlation_index", label: "Spurious Correlation", max: 1, invert: true },
  { key: "entropy", label: "Entropy", max: 7 },
  { key: "sparsity", label: "Sparsity", max: 1 },
  { key: "attention_concentration", label: "Attention Concentration", max: 1 },
  { key: "attention_mean", label: "Attention Mean", max: 1 },
  { key: "attention_max", label: "Attention Max", max: 1 },
  { key: "peak_intensity_ratio", label: "Peak Intensity Ratio", max: 20 },
];

function getMetricColor(value: number, max: number, invert?: boolean): string {
  const normalized = Math.min(value / max, 1);
  const score = invert ? 1 - normalized : normalized;

  if (score >= 0.7) return "#4CAF50";
  if (score >= 0.4) return "#FF9800";
  return "#EF5350";
}

function getRiskColor(tier: string): string {
  switch (tier) {
    case "CRITICAL": return "#d32f2f";
    case "HIGH": return "#EF5350";
    case "MODERATE": return "#FF9800";
    case "LOW": return "#4CAF50";
    default: return "#73777F";
  }
}

export default function Dashboard({
  selectedObject,
  diagnosisSections,
  currentSection,
  isDiagnosisDone,
  diagnosisMeta,
}: DashboardProps) {
  const [copiedJson, setCopiedJson] = useState(false);
  const sectionKeys = Object.keys(diagnosisSections);

  if (!selectedObject) {
    return (
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-surface-lowest rounded-2xl p-8 shadow-sm border border-surface-variant text-center">
            <span className="material-symbols-outlined text-4xl text-surface-variant mb-2 block">
              touch_app
            </span>
            <p className="text-sm text-on-surface-variant font-medium">
              Click a bounding box in the image to begin the analysis
            </p>
          </div>
        </div>
      </section>
    );
  }

  const metrics = selectedObject.xai_metrics;

  return (
    <section className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-surface-lowest rounded-2xl p-8 shadow-sm border border-surface-variant flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">description</span>
              <h2 className="text-xl font-bold font-headline text-primary tracking-tight">
                Technical Narrative
              </h2>
            </div>
            <span
              className="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border"
              style={{
                backgroundColor: `${getRiskColor(selectedObject.risk_tier)}15`,
                color: getRiskColor(selectedObject.risk_tier),
                borderColor: `${getRiskColor(selectedObject.risk_tier)}30`,
              }}
            >
              Severity: {selectedObject.risk_tier}
            </span>
          </div>

          {selectedObject.object_type === "FP" && (
            <div className="mb-5 p-4 bg-[#EF5350]/10 border border-[#EF5350]/20 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-[#EF5350] mt-0.5">warning</span>
              <div>
                <p className="text-sm font-bold text-[#EF5350]">False Positive (False Alarm)</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  ⚠ This bounding box is from YOLO&apos;s prediction. The ground truth indicates no real object exists here.
                </p>
              </div>
            </div>
          )}
          {selectedObject.object_type === "FN" && (
            <div className="mb-5 p-4 bg-[#FFB74D]/10 border border-[#FFB74D]/20 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-[#FFB74D] mt-0.5">visibility_off</span>
              <div>
                <p className="text-sm font-bold text-[#FFB74D]">False Negative (Missed Object)</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  ⚠ This bounding box is from the ground truth annotation. YOLO failed to detect this object — this is a blind spot.
                </p>
              </div>
            </div>
          )}
          {selectedObject.object_type === "TP" && (
            <div className="mb-5 p-4 bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-[#4CAF50] mt-0.5">verified</span>
              <div>
                <p className="text-sm font-bold text-[#4CAF50]">True Positive (Correct Detection)</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  ✓ This bounding box is a correct YOLO detection that matches the ground truth.
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-primary-container/30 rounded-lg border-l-4 border-primary mb-5">
            <p className="font-bold text-primary text-sm">
              Subject: {selectedObject.object_type} Detection — {selectedObject.object_class}
              {selectedObject.confidence
                ? ` [Conf: ${(selectedObject.confidence * 100).toFixed(1)}%]`
                : " [Missed Detection]"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar font-body text-sm leading-relaxed text-on-surface-variant space-y-4">
            {sectionKeys.length === 0 ? (
              <div className="flex items-center gap-2 text-on-surface-variant">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading VLM diagnosis...</span>
              </div>
            ) : (
              sectionKeys.map((key) => {
                const config = SECTION_LABELS[key] || { label: key, color: "#666" };
                const text = diagnosisSections[key] || "";
                const isActive = key === currentSection && !isDiagnosisDone;

                return (
                  <div key={key}>
                    {sectionKeys.length > 1 && (
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: config.color }}
                      >
                        {text ? "▼" : "▸"} {config.label}
                      </p>
                    )}
                    <div
                      className="pl-3"
                      style={{
                        borderLeft: `3px solid ${text ? config.color : "#ddd"}`,
                      }}
                    >
                      <p className={isActive ? "typewriter-cursor" : ""}>
                        {text || <span className="text-outline italic">Pending...</span>}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {isDiagnosisDone && diagnosisMeta?.is_ground_truth && (
              <div className="mt-3 px-3 py-1.5 bg-secondary-container/40 rounded-lg inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary">info</span>
                <span className="text-[10px] text-secondary font-semibold">
                  Showing ground truth reference (no VLM prediction for this object)
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-surface-variant flex justify-end gap-3">
            <button
              onClick={() => {
                const json = JSON.stringify(selectedObject, null, 2);
                navigator.clipboard.writeText(json);
                setCopiedJson(true);
                setTimeout(() => setCopiedJson(false), 2000);
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-primary font-bold text-sm hover:bg-primary/5 rounded-lg transition-colors border border-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedJson ? "check" : "content_copy"}
              </span>
              {copiedJson ? "Copied!" : "Copy Raw Data"}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-surface-lowest rounded-2xl p-6 shadow-sm border border-surface-variant">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sm text-primary">bar_chart</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-secondary">
              Node Statistics
            </h4>
          </div>

          <div className="space-y-3">
            {selectedObject.confidence !== null && (
              <MetricBar
                label="Model Confidence"
                value={selectedObject.confidence}
                max={1}
                color="#2196F3"
              />
            )}
            {selectedObject.iou !== null && (
              <MetricBar
                label="IoU with Ground Truth"
                value={selectedObject.iou}
                max={1}
                color="#4CAF50"
              />
            )}

            {METRIC_CONFIG.slice(0, 5).map(({ key, label, max, invert }) => (
              <MetricBar
                key={key}
                label={label}
                value={metrics[key]}
                max={max}
                color={getMetricColor(metrics[key], max, invert)}
              />
            ))}
          </div>
        </div>

        <div className="bg-surface-lowest rounded-2xl p-6 shadow-sm border border-surface-variant">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sm text-primary">account_tree</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-secondary">
              Causal Antecedents
            </h4>
          </div>
          <ul className="space-y-3">
            <CausalItem
              color={metrics.background_leakage > 0.9 ? "#EF5350" : "#004B8D"}
              bold={metrics.background_leakage > 0.9}
              text={`Background Leakage: ${metrics.background_leakage.toFixed(4)}`}
            />
            <CausalItem
              color={metrics.spurious_correlation_index > 0.5 ? "#EF5350" : "#004B8D"}
              bold={metrics.spurious_correlation_index > 0.5}
              text={`Spurious Correlation: ${metrics.spurious_correlation_index.toFixed(4)}`}
            />
            <CausalItem
              color="#004B8D"
              text={`Attention Focus: ${metrics.focus_score.toFixed(2)}`}
            />
          </ul>
        </div>

        <div className="bg-primary-container/40 rounded-2xl p-6 border border-primary/10">
          <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mb-2">
            System Status
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono text-primary/80">
              PIPELINE V.2.4 NOMINAL
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-on-surface-variant">{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {value.toFixed(value < 1 ? 4 : 2)}
        </span>
      </div>
      <div className="w-full bg-surface-ctr h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-bar-animated"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function CausalItem({
  color,
  text,
  bold,
}: {
  color: string;
  text: string;
  bold?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <div
        className="mt-1 w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span
        className={`text-[11px] text-on-surface leading-tight ${bold ? "font-bold" : "font-medium"}`}
      >
        {text}
      </span>
    </li>
  );
}
