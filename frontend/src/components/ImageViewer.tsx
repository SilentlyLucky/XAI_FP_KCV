"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { DetectedObject, ViewMode } from "@/lib/types";
import { getImageUrl, getHeatmapUrl } from "@/lib/api";

interface ImageViewerProps {
  imageId: string | null;
  objects: DetectedObject[];
  selectedIdx: number | null;
  onSelect: (idx: number | null) => void;
  viewMode: ViewMode;
  isLoading: boolean;
  isDiagnosing?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  TP: "#4CAF50",
  FP: "#EF5350",
  FN: "#FFB74D",
};

export default function ImageViewer({
  imageId,
  objects,
  selectedIdx,
  onSelect,
  viewMode,
  isLoading,
  isDiagnosing = false,
}: ImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [heatmapEl, setHeatmapEl] = useState<HTMLImageElement | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!imageId) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImgEl(img);
    img.src = getImageUrl(imageId);

    return () => {
      setImgEl(null);
      setHeatmapEl(null);
    };
  }, [imageId]);

  useEffect(() => {
    if (!imageId) return;
    const hm = new Image();
    hm.crossOrigin = "anonymous";
    hm.onload = () => setHeatmapEl(hm);
    hm.onerror = () => setHeatmapEl(null);
    hm.src = getHeatmapUrl(imageId);
  }, [imageId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const getImageLayout = useCallback(() => {
    if (!imgEl || !containerSize.w) return null;
    const imgAspect = imgEl.naturalWidth / imgEl.naturalHeight;
    const contAspect = containerSize.w / containerSize.h;
    let rw: number, rh: number, ox: number, oy: number;

    if (imgAspect > contAspect) {
      rw = containerSize.w;
      rh = containerSize.w / imgAspect;
      ox = 0;
      oy = (containerSize.h - rh) / 2;
    } else {
      rh = containerSize.h;
      rw = containerSize.h * imgAspect;
      ox = (containerSize.w - rw) / 2;
      oy = 0;
    }
    return { rw, rh, ox, oy };
  }, [imgEl, containerSize]);

  const scaleBox = useCallback(
    (bbox: [number, number, number, number]) => {
      const layout = getImageLayout();
      if (!layout || !imgEl) return { x: 0, y: 0, w: 0, h: 0 };

      const scaleX = layout.rw / imgEl.naturalWidth;
      const scaleY = layout.rh / imgEl.naturalHeight;

      return {
        x: bbox[0] * scaleX + layout.ox,
        y: bbox[1] * scaleY + layout.oy,
        w: bbox[2] * scaleX,
        h: bbox[3] * scaleY,
      };
    },
    [getImageLayout, imgEl]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imgEl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width: cw, height: ch } = container.getBoundingClientRect();
    canvas.width = cw * window.devicePixelRatio;
    canvas.height = ch * window.devicePixelRatio;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const layout = getImageLayout();
    if (!layout) return;

    ctx.clearRect(0, 0, cw, ch);

    if (viewMode === "heatmap" && heatmapEl && selectedIdx === null) {
      ctx.drawImage(heatmapEl, layout.ox, layout.oy, layout.rw, layout.rh);
    } else {
      ctx.drawImage(imgEl, layout.ox, layout.oy, layout.rw, layout.rh);
    }

    if (viewMode !== "rgb") {
      objects.forEach((obj, idx) => {
        const box = scaleBox(obj.bbox);
        const color = TYPE_COLORS[obj.object_type] || "#888";
        const isSelected = selectedIdx === idx;

        ctx.save();

        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 3 : 2;
        if (obj.object_type === "FN") {
          ctx.setLineDash([6, 4]);
        }

        if (selectedIdx !== null && !isSelected) {
          ctx.globalAlpha = 0.3;
        }

        ctx.strokeRect(box.x, box.y, box.w, box.h);
        ctx.setLineDash([]);

        if (isSelected) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
          ctx.strokeRect(box.x, box.y, box.w, box.h);
          ctx.shadowBlur = 0;
        }

        const label =
          obj.object_type === "TP"
            ? `${obj.object_class} ${obj.confidence?.toFixed(2) ?? ""}`
            : obj.object_type === "FP"
              ? `FP: ${obj.object_class} ${obj.confidence ? obj.confidence.toFixed(2) : ""} (GT: none)`
              : `FN: ${obj.object_class} (Missed)`;

        ctx.font = "bold 9px Inter, sans-serif";
        const textW = ctx.measureText(label).width + 8;

        const labelX = box.x;
        const labelY = box.y - 14;

        ctx.fillStyle = color;
        ctx.fillRect(labelX, labelY, textW, 14);

        ctx.fillStyle = obj.object_type === "FP" ? "#fff" : "#0f1117";
        ctx.fillText(label, labelX + 4, labelY + 10);

        ctx.restore();
      });
    }

    if (selectedIdx !== null && heatmapEl) {
      const selectedObj = objects[selectedIdx];
      if (selectedObj) {
        const box = scaleBox(selectedObj.bbox);

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";

        ctx.fillRect(0, 0, cw, box.y);
        ctx.fillRect(0, box.y, box.x, box.h);
        ctx.fillRect(box.x + box.w, box.y, cw - box.x - box.w, box.h);
        ctx.fillRect(0, box.y + box.h, cw, ch - box.y - box.h);

        const radius = Math.max(box.w, box.h) * 1.5 / 2;
        const centerX = box.x + box.w / 2;
        const centerY = box.y + box.h / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.filter = "blur(8px)";
        ctx.drawImage(heatmapEl, layout.ox, layout.oy, layout.rw, layout.rh);
        ctx.filter = "none";
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowColor = TYPE_COLORS[selectedObj.object_type] || "#FFA62B";
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "transparent";
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, box.w, box.h, 4);
        ctx.stroke();
        ctx.restore();
      }
    }
  }, [imgEl, heatmapEl, objects, selectedIdx, viewMode, containerSize, getImageLayout, scaleBox]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDiagnosing) return;

      const canvas = canvasRef.current;
      if (!canvas || !imgEl) return;

      const rect = canvas.getBoundingClientRect();
      const scaleStr = canvas.style.transform;
      const scaleMatch = scaleStr.match(/scale\(([^)]+)\)/);
      const scaleAmt = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

      const clickX = (e.clientX - rect.left) / scaleAmt;
      const clickY = (e.clientY - rect.top) / scaleAmt;

      for (let i = objects.length - 1; i >= 0; i--) {
        const box = scaleBox(objects[i].bbox);
        if (
          clickX >= box.x &&
          clickX <= box.x + box.w &&
          clickY >= box.y &&
          clickY <= box.y + box.h
        ) {
          if (selectedIdx === i) {
            onSelect(null);
          } else {
            onSelect(i);
          }
          return;
        }
      }

      if (selectedIdx !== null) {
        onSelect(null);
      }
    },
    [objects, scaleBox, onSelect, imgEl, selectedIdx, isDiagnosing]
  );

  const getZoomStyle = useCallback(() => {
    if (selectedIdx === null || !imgEl) return {};

    const obj = objects[selectedIdx];
    if (!obj) return {};

    const box = scaleBox(obj.bbox);
    const centerX = box.x + box.w / 2;
    const centerY = box.y + box.h / 2;

    return {
      transform: `scale(1.5)`,
      transformOrigin: `${centerX}px ${centerY}px`,
      transition: "transform 0.4s ease-out, transform-origin 0.4s ease-out"
    };
  }, [selectedIdx, objects, scaleBox, imgEl]);

  const selectedObj = selectedIdx !== null ? objects[selectedIdx] : null;

  return (
    <section className="relative w-full aspect-video md:aspect-21/9 rounded-2xl overflow-hidden bg-surface-highest shadow-xl border border-surface-variant group">
      <div ref={containerRef} className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-on-surface-variant font-medium">Running pipeline...</span>
            </div>
          </div>
        ) : imageId ? (
          <canvas
            ref={canvasRef}
            className={`w-full h-full transform-gpu ${isDiagnosing ? "cursor-wait" : "cursor-crosshair"}`}
            style={getZoomStyle()}
            onClick={handleCanvasClick}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-surface-variant mb-3 block">
                camera_outdoor
              </span>
              <p className="text-sm text-on-surface-variant font-medium">
                Click <span className="font-bold text-primary">New Analysis</span> to analyze a random test image
              </p>
            </div>
          </div>
        )}
      </div>

      {imageId && (
        <>
          <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 pointer-events-none">
            <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[10px] font-mono text-white tracking-wider">
                IMAGE: {imageId}.jpg
              </span>
            </div>
            {selectedObj && (
              <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10">
                <span className="text-[10px] font-mono text-white tracking-wider">
                  SELECTED: {selectedObj.object_class.toUpperCase()} ({selectedObj.object_type})
                </span>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 right-4 z-30 pointer-events-none">
            <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md rounded border border-white/10">
              <p className="text-[10px] font-mono text-blue-300 tracking-tight">
                OBJECTS: {objects.length} DETECTED
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 z-30 pointer-events-none">
            <div className="px-3 py-2 bg-black/70 backdrop-blur-md rounded border border-white/10 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-tp" />
                <span className="text-[10px] font-mono text-white tracking-wider">TP — Correct Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-fp" />
                <span className="text-[10px] font-mono text-white tracking-wider">FP — False Alarm</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-fn border-dashed" />
                <span className="text-[10px] font-mono text-white tracking-wider">FN — Missed Object</span>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
