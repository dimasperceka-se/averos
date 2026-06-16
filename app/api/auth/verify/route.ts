import { NextResponse } from "next/server";
import { findByToken, updateUser } from "@/lib/server/userStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (token) {
    const user = await findByToken(token);
    if (user) {
      await updateUser(user.id, { verified: true, verifyToken: null });
      return NextResponse.redirect(`${url.origin}/login?verified=1`);
    }
  }
  return NextResponse.redirect(`${url.origin}/login?verified=0`);
}
