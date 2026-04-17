import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

if (!BACKEND_URL) {
  console.error(
    "[Proxy] WARNING: BACKEND_API_URL is not set. " +
    "All proxy requests will fail with 503. " +
    "Add BACKEND_API_URL to your Vercel Environment Variables."
  );
}

const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "content-length",
  "content-encoding",
  "accept-encoding",
]);

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "BACKEND_API_URL not configured on server" },
      { status: 503 }
    );
  }

  const { path } = await params;
  const backendPath = "/" + path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${backendPath}${search}`;

  console.log(`[Proxy] ${request.method} → ${targetUrl}`);

  const isSSE =
    request.headers.get("accept")?.includes("text/event-stream") ||
    backendPath.includes("/generate") ||
    backendPath.includes("/diagnosis");

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("ngrok-skip-browser-warning", "true");
  if (isSSE) {
    headers.set("accept", "text/event-stream");
    headers.set("cache-control", "no-cache");
  }

  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      cache: "no-store",
      // @ts-expect-error Next.js extended fetch supports duplex for streaming bodies
      duplex: hasBody ? "half" : undefined,
    });

    console.log(`[Proxy] ← ${res.status} ${targetUrl}`);

    if (isSSE) {
      return new NextResponse(res.body, {
        status: res.status,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "X-Accel-Buffering": "no",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const responseContentType =
      res.headers.get("content-type") || "application/octet-stream";

    if (responseContentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    return new NextResponse(res.body, {
      status: res.status,
      headers: {
        "Content-Type": responseContentType,
      },
    });
  } catch (error) {
    console.error("[Proxy] Fetch failed:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        detail: String(error),
        target: targetUrl,
      },
      { status: 502 }
    );
  }
}

export const runtime = "edge";

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
