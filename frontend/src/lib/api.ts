import type { ImageData, PipelineStage } from "./types";

const PROXY_BASE = "/api/backend";

export const API_BASE =
  typeof window === "undefined" ? process.env.BACKEND_API_URL || "http://localhost:8000" : "";

function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${PROXY_BASE}${normalizedPath}`;
  }
  return `${API_BASE}${normalizedPath}`;
}

export function getImageUrl(imageId: string): string {
  return apiUrl(`/api/image/${imageId}`);
}

export function getHeatmapUrl(imageId: string): string {
  return apiUrl(`/api/heatmap/${imageId}`);
}

export function getPanelUrl(imageId: string): string {
  return apiUrl(`/api/panel/${imageId}`);
}

export async function fetchResults(imageId: string): Promise<ImageData> {
  const res = await fetch(apiUrl(`/api/results/${imageId}`));
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch(apiUrl(`/api/summary`));
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

async function readSSEStream(
  url: string,
  signal: AbortSignal,
  onLine: (data: unknown) => void
) {
  const res = await fetch(url, {
    signal,
    headers: { Accept: "text/event-stream" },
  });

  if (!res.ok || !res.body) {
    console.error(`[SSE] Request failed: ${res.status} ${url}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop()!;

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try {
        onLine(JSON.parse(line.slice(5).trim()));
      } catch {
        console.warn("[SSE] Failed to parse line:", line);
      }
    }
  }
}

export function streamGenerate(
  onStage: (
    stage: PipelineStage["stage"],
    status: string,
    message?: string
  ) => void,
  onComplete: (imageId: string, stats: Record<string, unknown>) => void
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      await readSSEStream(
        `${PROXY_BASE}/api/generate`,
        controller.signal,
        (data) => {
          const d = data as {
            stage: PipelineStage["stage"];
            status: string;
            message?: string;
            image_id?: string;
            stats?: Record<string, unknown>;
          };
          if (d.stage === "complete") {
            onComplete(d.image_id!, d.stats!);
          } else {
            onStage(d.stage, d.status, d.message);
          }
        }
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("[SSE] streamGenerate error:", err);
      }
    }
  })();

  return () => controller.abort();
}

export function streamDiagnosis(
  imageId: string,
  objectIdx: number,
  onMeta: (meta: {
    is_ground_truth: boolean;
    rouge1: number | null;
    bert_score_f1: number | null;
  }) => void,
  onSection: (section: string) => void,
  onToken: (token: string) => void,
  onDone: () => void
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      await readSSEStream(
        `${PROXY_BASE}/api/diagnosis/${imageId}/${objectIdx}`,
        controller.signal,
        (data) => {
          const d = data as {
            type: string;
            section?: string;
            token?: string;
            is_ground_truth?: boolean;
            rouge1?: number | null;
            bert_score_f1?: number | null;
          };
          switch (d.type) {
            case "meta":
              onMeta({
                is_ground_truth: d.is_ground_truth!,
                rouge1: d.rouge1 ?? null,
                bert_score_f1: d.bert_score_f1 ?? null,
              });
              break;
            case "section":
              onSection(d.section!);
              break;
            case "token":
              onToken(d.token!);
              break;
            case "done":
              onDone();
              controller.abort();
              break;
          }
        }
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("[SSE] streamDiagnosis error:", err);
      }
    }
  })();

  return () => controller.abort();
}