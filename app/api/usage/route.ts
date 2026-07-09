import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";
import { addFreeUsedHa, findById, updateUser, type User } from "@/lib/server/userStore";
import { sameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";

const FREE_QUOTA_HA = 4;

/**
 * Server-authoritative routing decision for a submission (the 4 ha free-quota gate
 * lives here, not in the browser).
 */
function decide(user: User, totalArea: number, count: number) {
  if (user.paid) return "paid" as const;
  const remaining = Math.max(0, FREE_QUOTA_HA - (user.freeUsedHa ?? 0));
  const hasQuota = remaining > 0;
  const isBulk = count > 1;
  if (!isBulk && totalArea > FREE_QUOTA_HA) return hasQuota ? "survey" : "payment";
  if (!isBulk) return hasQuota ? "report" : "payment";
  return hasQuota ? "survey" : "payment";
}

function usageOf(u: User | null) {
  const freeUsedHa = u?.freeUsedHa ?? 0;
  const paid = u?.paid ?? false;
  return {
    freeUsedHa,
    paid,
    quotaHa: FREE_QUOTA_HA,
    remainingHa: Math.max(0, FREE_QUOTA_HA - freeUsedHa),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(usageOf(await findById(session.uid)));
}

export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { action?: string; area?: unknown; totalArea?: unknown; count?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const user = await findById(session.uid);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.action === "authorize") {
    // Check-only: returns the routing decision without mutating quota.
    const total = Math.max(0, Number(body.totalArea) || 0);
    const count = Math.max(1, Number(body.count) || 1);
    return NextResponse.json({ decision: decide(user, total, count), ...usageOf(user) });
  }

  if (body.action === "pay") {
    // NOTE: prototype — no real payment gateway. Production must verify a charge.
    await updateUser(user.id, { paid: true });
    return NextResponse.json(usageOf(await findById(session.uid)));
  }

  if (body.action === "consume") {
    const area = Math.max(0, Number(body.area) || 0);
    return NextResponse.json(usageOf(await addFreeUsedHa(user.id, area)));
  }

  return NextResponse.json(usageOf(user));
}
