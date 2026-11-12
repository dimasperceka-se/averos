"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlotStore } from "@/lib/plotStore";
import { plotScreening } from "@/lib/dds";
import { STATUS_BADGE, STATUS_LABEL, type DdsView } from "@/lib/ddsShared";
import { ddsApi, environmentLabel, formatDateTime, type DdsOverviewData } from "@/lib/ddsClient";
import { ui } from "@/components/dds/ui";
import EuisConnection from "@/components/dds/EuisConnection";

const COLS = "grid grid-cols-[1.6fr_0.9fr_0.8fr_1fr_80px] items-center gap-2.5";
const ha = (n: number) => `${n.toFixed(2)} ha`;

function title(s: DdsView) {
  return s.euis.referenceNumber ?? s.internalReference ?? "Draft";
}

export default function DdsSubmissionPage() {
  const router = useRouter();
  const { plots } = usePlotStore();
  const [data, setData] = useState<DdsOverviewData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const load = useCallback(async () => {
    const res = await ddsApi<DdsOverviewData>("/api/dds");
    if (res.ok) {
      setData(res.data);
      setLoadError("");
    } else setLoadError(res.error.error);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Only valid plots that passed screening (no loss after the cut-off, no protected-area overlap).
  const passed = useMemo(() => plots.filter((p) => p.isValid && plotScreening(p) === "passed"), [plots]);
  const otherCount = plots.length - passed.length;
  const chosen = passed.filter((p) => selected.has(p.id));
  const chosenHa = chosen.reduce((s, p) => s + p.areaHa, 0);
  const allChosen = passed.length > 0 && chosen.length === passed.length;

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const create = async () => {
    setCreating(true);
    setCreateError("");
    // Averos keeps plots in this browser session, so the draft takes a copy of them.
    const body = { plots: chosen.map((p) => ({ id: p.id, plotId: p.plotId, name: p.name, ring: p.ring, eudr: p.eudr })) };
    const res = await ddsApi<{ statement: DdsView }>("/api/dds", "POST", body);
    if (res.ok) {
      router.push(`/dashboard/dds/${res.data.statement.id}`);
      return;
    }
    setCreateError(res.error.error);
    setCreating(false);
  };

  const quota = data?.quota;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={ui.eyebrow}>{data ? environmentLabel(data.environment) : "EUIS"} · TRACES</span>
          <h1 className={ui.h1}>DDS Submission</h1>
        </div>
        {quota && (
          <p className="m-0 text-sm text-slate-600">
            {quota.limitHa === null ? "Paid plan: no DDS area limit" : `Free plan: ${quota.usedHa.toFixed(2)} of ${quota.limitHa} ha used in submitted DDS`}
          </p>
        )}
      </div>

      <p className="m-0 max-w-[880px] text-sm leading-relaxed text-slate-600">
        File a Due Diligence Statement with the EU Information System (EUIS) for plots that passed screening. Averos sends it to the
        EUIS <strong className="text-slate-900">Acceptance</strong> environment, the EU&apos;s test system: statements filed there have no
        legal effect.
      </p>

      {loadError && (
        <p role="alert" className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      )}

      {data && !data.identity && (
        <section aria-label="EUIS connection needed" className={`${ui.card} flex flex-wrap items-center justify-between gap-3 p-5`}>
          <div className="flex flex-col gap-1">
            <strong className="text-[15px] text-slate-900">Connect your EUIS Acceptance account</strong>
            <span className="text-sm text-slate-600">Add your web-service user and authentication key below before submitting.</span>
          </div>
          <a href="#euis" className={ui.btnDark}>
            Connect EUIS
          </a>
        </section>
      )}

      <section aria-label="Statements" className={`${ui.card} overflow-hidden`}>
        <div className="border-b border-slate-100 px-5 py-3.5 text-[13px] text-slate-500">
          {data ? `${data.statements.length} statement${data.statements.length === 1 ? "" : "s"}` : "Loading statements…"}
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className={`${COLS} px-5 py-3 text-[11px] font-medium tracking-wider text-slate-400 uppercase`}>
              <span>Statement</span>
              <span>Plots</span>
              <span>Status</span>
              <span>Updated</span>
              <span className="sr-only">Open</span>
            </div>
            {data?.statements.map((s) => (
              <div key={s.id} className={`${COLS} border-t border-slate-100 px-5 py-3.5 text-sm`}>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-mono text-[13px] font-semibold text-slate-900">{title(s)}</span>
                  <span className="truncate text-xs text-slate-500">{s.details.description || "No product details yet"}</span>
                </span>
                <span className="text-[13px] text-slate-700">
                  {s.plots.length} · <span className="font-mono">{ha(s.areaHa)}</span>
                </span>
                <span>
                  <span className={`${ui.badge} ${STATUS_BADGE[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                </span>
                <span className="text-[13px] text-slate-600">{formatDateTime(s.updatedAt)}</span>
                <Link href={`/dashboard/dds/${s.id}`} aria-label={`Open statement ${title(s)}`} className="justify-self-end text-[13px] font-semibold text-navy no-underline hover:underline">
                  Open →
                </Link>
              </div>
            ))}
            {data && !data.statements.length && (
              <p className="m-0 border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-400">No statements yet. Start one from your screened plots below.</p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="new-dds" className={`${ui.card} flex flex-col gap-4 p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="new-dds" className="m-0 text-xl font-bold text-slate-900">
            New DDS from screened plots
          </h2>
          {otherCount > 0 && (
            <span className="text-[13px] text-slate-500">
              {otherCount} plot{otherCount === 1 ? " hasn’t" : "s haven’t"} passed screening and can’t be included.
            </span>
          )}
        </div>

        {!passed.length ? (
          <p className="m-0 text-sm text-slate-600">
            No plots that passed screening in this session.{" "}
            <Link href="/dashboard" className="font-semibold text-navy">
              Upload and screen your plots
            </Link>{" "}
            first; only plots without tree-cover loss after 2020 or protected-area overlap can go into a DDS.
          </p>
        ) : (
          <>
            <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={allChosen}
                onChange={() => setSelected(allChosen ? new Set() : new Set(passed.map((p) => p.id)))}
                className="h-4 w-4 accent-[#1b3a6b]"
              />
              Select all screened plots
            </label>
            <ul className="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-2">
              {passed.map((p, i) => (
                <li key={p.id}>
                  <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:border-navy">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-[#1b3a6b]" />
                    <span className="min-w-0 flex-1 truncate">{p.name || `Plot ${i + 1}`}</span>
                    <span className="font-mono text-xs text-slate-500">{ha(p.areaHa)}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" disabled={!chosen.length || creating} onClick={create} className={ui.btnDark}>
                {creating ? "Creating…" : "Create draft"}
              </button>
              <span className="text-[13px] text-slate-500">
                {chosen.length} selected · {ha(chosenHa)}
              </span>
              {createError && (
                <span role="alert" className="text-sm text-red-700">
                  {createError}
                </span>
              )}
            </div>
          </>
        )}
      </section>

      <EuisConnection onChange={load} />
    </>
  );
}
