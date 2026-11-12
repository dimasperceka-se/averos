import { ddsRoute, jsonBody } from "@/lib/server/ddsApi";
import { createDraft, ddsOverview } from "@/lib/server/dds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Statements, identity status and the DDS allowance. */
export async function GET(req: Request) {
  return ddsRoute(req, (user) => ddsOverview(user));
}

/** New draft from plots that passed screening: `{ plots: { id, plotId, name, ring, eudr }[] }`. */
export async function POST(req: Request) {
  // Plots carry their geometry (up to 1000 plots), hence the larger body limit.
  return ddsRoute(req, async (user) => ({ statement: await createDraft(user, await jsonBody(req, 8 * 1024 * 1024)) }), { write: true });
}
