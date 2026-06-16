"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowUpRight, Download, Plus, Shapes } from "lucide-react";
import { analysisByKey } from "@/lib/data";
import { usePlotStore } from "@/lib/plotStore";
import type { FeatureCollection, Plot } from "@/lib/geo";
import { runEudr, validateGeometry } from "@/lib/analysisClient";
import { downloadPlotsExcel } from "@/lib/excel";
import DashboardNavbar from "@/components/DashboardNavbar";
import AddPlotModal from "@/components/AddPlotModal";
import AnalyzingOverlay from "@/components/AnalyzingOverlay";

const PlotDisplayMap = dynamic(() => import("@/components/PlotDisplayMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

const isInvalid = (p: Plot) => !p.isValid;

export default function DashboardPage() {
  const router = useRouter();
  const { plots, userName, analyses, addPlots, updatePlots, setEudrDone } =
    usePlotStore();
  const eudrSteps = analyses.map((k) => {
    const a = analysisByKey(k);
    return { label: a.title, icon: a.icon };
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [addRunning, setAddRunning] = useState(false);
  const [addDone, setAddDone] = useState(false);
  const [eudrRunning, setEudrRunning] = useState(false);
  const [eudrAnimDone, setEudrAnimDone] = useState(false);

  const { totalArea, valid, invalid } = useMemo(() => {
    const inv = plots.filter(isInvalid).length;
    return {
      totalArea: plots.reduce((s, p) => s + p.areaHa, 0),
      valid: plots.length - inv,
      invalid: inv,
    };
  }, [plots]);

  const handleAddPlot = async (fc: FeatureCollection, filename: string) => {
    setModalOpen(false);
    setAddDone(false);
    setAddRunning(true);
    try {
      addPlots(await validateGeometry(fc, filename));
    } finally {
      setAddDone(true);
    }
  };

  const startEudr = async () => {
    if (!plots.length) return;
    setEudrAnimDone(false);
    setEudrRunning(true);
    try {
      const run = await runEudr(plots, analyses);
      updatePlots(run.plots);
      setEudrDone(true);
    } finally {
      setEudrAnimDone(true);
    }
  };

  return (
    <>
      <DashboardNavbar />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Welcome header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Welcome, {userName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here&apos;s your land at a glance
            </p>
          </div>

          {plots.length === 0 ? (
            <div className="mx-auto mt-12 max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-base font-bold text-navy">No plots yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Add a plot to see your land analysis here.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add plot
              </button>
            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {/* Left: summary card */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 rounded-xl bg-teal-200/60 px-4 py-3.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-teal-700/40 text-teal-800">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-bold text-teal-900">Plot Uploaded</span>
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
                    <div className="rounded-xl bg-slate-100 p-5">
                      <p className="text-sm font-medium text-slate-500">
                        Total Plot Area
                      </p>
                      <p className="mt-2 text-4xl font-extrabold text-slate-900">
                        {totalArea.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-400">Hectare</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="flex w-28 flex-col items-center justify-center gap-1 rounded-xl bg-navy text-sm font-semibold text-white hover:bg-navy-mid"
                    >
                      <Plus className="h-6 w-6" aria-hidden="true" />
                      Add plot
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <Stat label="Total Plot" value={plots.length} unit="Plot" />
                    <Stat label="Valid" value={valid} unit="Plot" tone="green" />
                    <Stat label="Invalid" value={invalid} unit="Plot" />
                  </div>
                </div>

                {/* Right: map */}
                <PlotDisplayMap plots={plots} />
              </div>

              {/* Plots table */}
              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Plots</h2>
                  <button
                    type="button"
                    onClick={() => {
                      downloadPlotsExcel(plots).catch(() => {});
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Export Excel
                  </button>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="py-3 pr-4 font-medium">No</th>
                        <th className="py-3 pr-4 font-medium">Area</th>
                        <th className="py-3 pr-4 font-medium">Duplicate Vertices</th>
                        <th className="py-3 pr-4 font-medium">Zero Area</th>
                        <th className="py-3 pr-4 font-medium">Self-Intersection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plots.map((plot, i) => (
                        <tr key={plot.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-4 pr-4 text-slate-700">{i + 1}</td>
                          <td className="py-4 pr-4 font-medium text-slate-700">
                            {plot.areaHa.toFixed(2)} ha
                          </td>
                          <Flag bad={plot.checks.duplicateVertices} />
                          <Flag bad={plot.checks.zeroArea} />
                          <Flag bad={plot.checks.selfIntersection} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Run EUDR */}
              <button
                type="button"
                onClick={startEudr}
                className="mt-6 flex w-full items-center justify-between rounded-2xl bg-navy px-8 py-6 text-lg font-bold text-white transition-colors hover:bg-navy-mid"
              >
                Run EUDR Analysis
                <ArrowRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </main>

      <AddPlotModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedAnalyses={analyses.map((k) => analysisByKey(k).title)}
        onAnalyze={handleAddPlot}
      />

      {/* Add-plot geometry check */}
      <AnalyzingOverlay
        open={addRunning}
        done={addDone}
        steps={[{ label: "Geometry Checker", icon: Shapes }]}
        onComplete={() => setAddRunning(false)}
      />

      {/* EUDR analysis */}
      <AnalyzingOverlay
        open={eudrRunning}
        done={eudrAnimDone}
        steps={eudrSteps}
        onComplete={() => {
          setEudrRunning(false);
          router.push("/dashboard/eudr");
        }}
      />
    </>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  tone?: "green";
}) {
  return (
    <div className="rounded-xl bg-slate-100 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold ${
          tone === "green" ? "text-accent" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-400">{unit}</p>
    </div>
  );
}

function Flag({ bad }: { bad: boolean }) {
  return (
    <td className="py-4 pr-4">
      <span className={bad ? "font-semibold text-red-500" : "text-slate-500"}>
        {bad ? "Found" : "None"}
      </span>
    </td>
  );
}
