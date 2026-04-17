"use client";

import { useState, useCallback, useRef } from "react";
import type { ImageData, PipelineStage, ViewMode } from "@/lib/types";
import { fetchResults, streamGenerate, streamDiagnosis } from "@/lib/api";
import { useTypewriter } from "@/hooks/useTypewriter";
import Header from "@/components/Header";
import PipelineStepper from "@/components/PipelineStepper";
import ImageViewer from "@/components/ImageViewer";
import Dashboard from "@/components/Dashboard";

const INITIAL_STAGES: PipelineStage[] = [
  { stage: "yolo", status: "pending" },
  { stage: "eigencam", status: "pending" },
  { stage: "vlm", status: "pending" },
];

export default function DashboardPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("bbox");

  const typewriter = useTypewriter();
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleGenerate = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setIsLoading(true);
    setImageData(null);
    setImageId(null);
    setSelectedIdx(null);
    typewriter.reset();
    setStages(INITIAL_STAGES.map((s) => ({ ...s, status: "pending" })));

    const cleanup = streamGenerate(
      (stage, status, message) => {
        setStages((prev) =>
          prev.map((s) =>
            s.stage === stage
              ? { ...s, status: status as PipelineStage["status"], message }
              : s
          )
        );
      },
      async (newImageId) => {
        setImageId(newImageId);
        try {
          const data = await fetchResults(newImageId);
          setImageData(data);
          setViewMode("bbox");
        } catch (err) {
          console.error("Failed to fetch results:", err);
        }
        setIsLoading(false);
      }
    );
    cleanupRef.current = cleanup;
  }, [typewriter]);

  const handleSelectObject = useCallback(
    (idx: number | null) => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      setSelectedIdx(idx);
      typewriter.reset();

      if (imageId && idx !== null) {
        const cleanup = streamDiagnosis(
          imageId,
          idx,
          typewriter.onMeta,
          typewriter.onSection,
          typewriter.onToken,
          typewriter.onDone
        );
        cleanupRef.current = cleanup;
      }
    },
    [imageId, typewriter]
  );

  const selectedObject =
    imageData && selectedIdx !== null
      ? imageData.objects[selectedIdx] ?? null
      : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        stats={imageData?.stats ?? null}
        isLoading={isLoading}
        onGenerate={handleGenerate}
      />

      <PipelineStepper stages={stages} />

      <main className="flex-1 flex flex-col p-6 max-w-[1600px] mx-auto w-full">
        <ImageViewer
          imageId={imageId}
          objects={imageData?.objects ?? []}
          selectedIdx={selectedIdx}
          onSelect={handleSelectObject}
          viewMode={viewMode}
          isLoading={isLoading}
          isDiagnosing={selectedIdx !== null && !typewriter.isDone}
        />

        {imageId && (
          <section className="mt-6 flex justify-center">
            <div className="inline-flex p-1 bg-surface-ctr rounded-xl gap-1 shadow-sm">
              {(
                [
                  { mode: "rgb" as ViewMode, label: "RGB" },
                  { mode: "bbox" as ViewMode, label: "Bounding Box" },
                  { mode: "heatmap" as ViewMode, label: "Heatmap + BBox" },
                ] as const
              ).map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === mode
                    ? "bg-primary text-on-primary shadow-md shadow-primary/20 font-bold"
                    : "bg-surface-lowest text-on-surface-variant hover:bg-white"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        )}

        <Dashboard
          selectedObject={selectedObject}
          diagnosisSections={typewriter.sections}
          currentSection={typewriter.currentSection}
          isDiagnosisDone={typewriter.isDone}
          diagnosisMeta={typewriter.meta}
        />
      </main>
      <footer className="bg-primary w-full relative z-100 mt-auto">
        <div className="w-full px-8 py-8 text-center text-white/80 text-sm font-bold uppercase tracking-widest border-t border-white/10">
          © 2026 Visionguard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
