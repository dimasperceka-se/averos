import { useEffect, useState } from "react";
import type { DdsQuota, DdsView, EuisIdentityView, ReadinessItem } from "./ddsShared";

/** Whether this account may use DDS Submission: null while asking, then true or false. */
export function useDdsAccess(): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    fetch("/api/dds/access", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => live && setEnabled(!!d.enabled))
      .catch(() => live && setEnabled(false));
    return () => {
      live = false;
    };
  }, []);
  return enabled;
}

export type DdsOverviewData = { identity: EuisIdentityView | null; statements: DdsView[]; quota: DdsQuota; environment: "acceptance" | "mock" };
export type DdsStatementData = { statement: DdsView; identity: EuisIdentityView | null; quota: DdsQuota; environment: "acceptance" | "mock" };
export type ApiError = { error: string; readiness?: ReadinessItem[]; nextCheckAt?: number };

/** fetch + JSON, with the server's error message on failure. */
export async function ddsApi<T>(url: string, method = "GET", body?: unknown): Promise<{ ok: true; data: T } | { ok: false; status: number; error: ApiError }> {
  try {
    const res = await fetch(url, {
      method,
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: data as T };
    return { ok: false, status: res.status, error: { error: "Something went wrong. Please try again.", ...data } };
  } catch {
    return { ok: false, status: 0, error: { error: "Network error. Check your connection and try again." } };
  }
}

export const environmentLabel = (env: "acceptance" | "mock") => (env === "mock" ? "Mock EUIS (local test)" : "EUIS Acceptance");

export function formatDateTime(ms: number | undefined): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** "in 52 min", "in 1 h 5 min", "now". */
export function inMinutes(target: number | undefined, now: number): string {
  if (!target || target <= now) return "now";
  const min = Math.ceil((target - now) / 60000);
  if (min < 60) return `in ${min} min`;
  return `in ${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}`;
}
