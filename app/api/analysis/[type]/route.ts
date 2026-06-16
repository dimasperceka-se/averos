import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";

export const runtime = "nodejs";
export const maxDuration = 120; // upstream can take ~10s/call (Vercel hint)

const BASE =
  process.env.ANALYSIS_API_BASE || "https://global-compliance-system.com";

const ALLOWED = new Set([
  "deforestation",
  "protected-area",
  "validate-geometry",
  "rainfall",
  "ghg-emission",
]);

export async function POST(
  req: Request,
  ctx: { params: Promise<{ type: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await ctx.params;
  if (!ALLOWED.has(type)) {
    return NextResponse.json({ error: "Unknown analysis type" }, { status: 404 });
  }

  let body: { geojson?: unknown; filename?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.geojson) {
    return NextResponse.json({ error: "Missing geojson" }, { status: 400 });
  }

  // The FastAPI endpoints expect a GeoJSON file via multipart/form-data (field "file").
  const blob = new Blob([JSON.stringify(body.geojson)], {
    type: "application/geo+json",
  });
  const form = new FormData();
  form.append("file", blob, body.filename || "plots.geojson");

  try {
    const upstream = await fetch(`${BASE}/api/v1/${type}`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(110_000),
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (e) {
    console.error(`[analysis:${type}]`, (e as Error).message);
    return NextResponse.json(
      { error: "Upstream analysis service unavailable", detail: (e as Error).message },
      { status: 502 },
    );
  }
}
