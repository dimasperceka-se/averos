import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";
import { findById } from "@/lib/server/userStore";
import { ddsAllowed } from "@/lib/server/ddsAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Whether the signed-in account may use DDS Submission (drives the "Soon" state in the menu). */
export async function GET() {
  const session = await getSession();
  const account = session ? await findById(session.uid) : null;
  return NextResponse.json({ enabled: ddsAllowed(account?.email) });
}
