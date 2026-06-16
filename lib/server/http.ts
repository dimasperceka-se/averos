/**
 * Reject cross-site state-changing requests (defense-in-depth alongside the
 * SameSite=Lax session cookie). Same-origin fetch() always sends an Origin
 * header; requests that omit it entirely (some same-origin navigations) are
 * allowed through.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
