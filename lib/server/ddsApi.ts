import { NextResponse } from "next/server";
import { getSession } from "./session";
import { sameOrigin } from "./http";
import { findById } from "./userStore";
import { DdsError } from "./ddsStore";
import { DDS_NOT_AVAILABLE, ddsAllowed } from "./ddsAccess";

export type ApiUser = { uid: string; name: string; email: string };

const MAX_BODY = 100 * 1024;

/** Signed-in user, same-origin check for writes, and DdsError → JSON. */
export async function ddsRoute(req: Request, fn: (user: ApiUser) => Promise<unknown>, { write = false } = {}) {
  if (write && !sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await getSession();
  const account = session ? await findById(session.uid) : null;
  if (!session || !account) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Every DDS and EUIS route goes through here, so this is the one gate.
  if (!ddsAllowed(account.email)) return NextResponse.json({ error: DDS_NOT_AVAILABLE }, { status: 403 });
  try {
    return NextResponse.json(await fn({ uid: session.uid, name: session.name, email: session.email }));
  } catch (e) {
    if (e instanceof DdsError) return NextResponse.json({ error: e.message, ...e.extra }, { status: e.status });
    console.error("[dds]", (e as Error)?.stack || e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function jsonBody(req: Request, maxBytes = MAX_BODY): Promise<Record<string, unknown>> {
  const raw = await req.text();
  if (raw.length > maxBytes) throw new DdsError("Request too large.", 413);
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    throw new DdsError("Invalid JSON.");
  }
}
