/**
 * Hasbi Foundation programme: every plan is free until the end of 30 Dec 2026
 * (WIB). Plans keep their normal rules (PAYG covers the selected plots,
 * Regular/Professional keep their monthly quota) — only the price is waived.
 * FREE_PROMO_UNTIL (an ISO date-time) overrides the end, e.g. to extend the
 * programme or to switch it off in tests.
 */
const DEFAULT_END = "2026-12-30T23:59:59.999+07:00";

/** Ledger status of a plan activated through the programme (no PayPal). */
export const PROMO_STATUS = "PROMO";

export function promoEndsAt(): number {
  const end = Date.parse(process.env.FREE_PROMO_UNTIL || DEFAULT_END);
  return Number.isFinite(end) ? end : Date.parse(DEFAULT_END);
}

export function promoActive(now = Date.now()): boolean {
  return now <= promoEndsAt();
}

/** Free Regular/Professional quotas start over every calendar month (UTC). */
export function promoPeriod(now = Date.now()): string {
  return `promo-${new Date(now).toISOString().slice(0, 7)}`;
}
