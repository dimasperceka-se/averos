"use client";

import { use, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { usePlotStore } from "@/lib/plotStore";
import { geometryIssues, type Plot } from "@/lib/geo";

const PlotDisplayMap = dynamic(() => import("@/components/PlotDisplayMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

type TabKey = "rainfall" | "deforestation" | "ghg" | "legality";

const TABS: { key: TabKey; label: string }[] = [
  { key: "rainfall", label: "Rainfall" },
  { key: "deforestation", label: "Deforestation" },
  { key: "ghg", label: "GHG Emissions" },
  { key: "legality", label: "Legality Analysis" },
];

type TabContent = {
  banner: { title: string; description: string };
  tiles: { label: string; value: string; sub?: string }[];
};

const fmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1 });
const titleCase = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const NO_DATA: TabContent = {
  banner: {
    title: "Not analyzed yet",
    description: "Run the EUDR analysis from the dashboard to populate this section.",
  },
  tiles: [],
};

function buildTabContent(plot: Plot): Record<TabKey, TabContent> {
  const d = plot.eudr?.deforestation;
  const r = plot.eudr?.rainfall;
  const g = plot.eudr?.ghg;
  const pa = plot.eudr?.protectedArea;
  const highRisk = (d?.riskLevel ?? "").toLowerCase() === "high";

  return {
    rainfall: r
      ? {
          banner: {
            title: "Rainfall analysis complete",
            description: r.period
              ? `Annual precipitation measured across the plot (${r.period.start} – ${r.period.end}).`
              : "Annual precipitation measured across the plot using satellite data.",
          },
          tiles: [
            { label: "Annual Mean", value: fmt(r.meanMm), sub: "mm" },
            { label: "Minimum", value: fmt(r.minMm), sub: "mm" },
            { label: "Maximum", value: fmt(r.maxMm), sub: "mm" },
            { label: "Std. Deviation", value: `±${fmt(r.stdMm)}`, sub: "mm" },
          ],
        }
      : NO_DATA,
    deforestation: d
      ? {
          banner: highRisk
            ? {
                title: "EUDR Non-Compliant — Deforestation detected",
                description:
                  "Deforestation activity was identified within this concession. This plot does not meet EUDR baseline requirements.",
              }
            : {
                title: "EUDR Compliant — No significant loss",
                description:
                  "No material tree-cover loss was detected within this plot against EUDR baselines.",
              },
          tiles: [
            { label: "GFW Loss area", value: `${fmt(d.gfw.ha)} ha`, sub: `${fmt(d.gfw.pct)}% of plot` },
            { label: "JRC Loss area", value: `${fmt(d.jrc.ha)} ha`, sub: `${fmt(d.jrc.pct)}% of plot` },
            { label: "SBTN Loss area", value: `${fmt(d.sbtn.ha)} ha`, sub: `${fmt(d.sbtn.pct)}% of plot` },
            { label: "Risk level", value: d.riskLevel },
          ],
        }
      : NO_DATA,
    ghg: g
      ? {
          banner: {
            title: "GHG emissions estimated",
            description:
              "Estimated greenhouse-gas emissions from deforestation across the available datasets.",
          },
          tiles: [
            { label: "Total net", value: fmt(g.totalTco2e), sub: "tCO₂e" },
            { label: "GFW", value: fmt(g.gfw.tco2e), sub: `tCO₂e · ${fmt(g.gfw.ha)} ha` },
            { label: "JRC", value: fmt(g.jrc.tco2e), sub: `tCO₂e · ${fmt(g.jrc.ha)} ha` },
            { label: "SBTN", value: fmt(g.sbtn.tco2e), sub: `tCO₂e · ${fmt(g.sbtn.ha)} ha` },
          ],
        }
      : NO_DATA,
    legality: pa
      ? {
          banner: {
            title:
              pa.status === "non_compliant"
                ? "Legality — Protected area overlap"
                : pa.status === "indicative"
                  ? "Legality — Indicative overlap"
                  : "Legality review complete",
            description:
              "WDPA protected-area status cross-checked against your plot boundary.",
          },
          tiles: [
            { label: "WDPA Status", value: titleCase(pa.status) },
            { label: "Categories", value: pa.categories.length ? pa.categories.join(", ") : "None" },
            {
              label: "Overlap",
              value:
                pa.status === "non_compliant"
                  ? "Yes"
                  : pa.status === "indicative"
                    ? "Indicative"
                    : "None",
            },
            {
              label: "Verdict",
              value:
                pa.status === "non_compliant"
                  ? "Non-Compliant"
                  : pa.status === "indicative"
                    ? "Review"
                    : "Compliant",
            },
          ],
        }
      : NO_DATA,
  };
}

export default function EudrPlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { plots } = usePlotStore();
  const plot = plots.find((p) => String(p.id) === id);
  const [tab, setTab] = useState<TabKey>("rainfall");

  if (!plot) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          back to dashboard
        </Link>
        <p className="mt-8 text-sm text-slate-500">
          Plot not found. It may have been cleared — return to the dashboard.
        </p>
      </div>
    );
  }

  const content = buildTabContent(plot)[tab];
  const centroid = plot.ring.reduce(
    (acc, [lon, lat]) => [acc[0] + lon / plot.ring.length, acc[1] + lat / plot.ring.length],
    [0, 0],
  );
  const d = plot.eudr?.deforestation;
  const highRisk = (d?.riskLevel ?? "").toLowerCase() === "high";

  const info: { label: string; value: string }[] = [
    { label: "Plot Name", value: plot.name },
    { label: "Area", value: `${plot.areaHa.toFixed(2)} ha` },
    { label: "Vertices", value: String(plot.ring.length) },
    {
      label: "Geometry",
      value: plot.isValid ? "Valid" : geometryIssues(plot).join(", "),
    },
    { label: "Data Source", value: "GeoJSON" },
    {
      label: "EUDR Status",
      value: !plot.isValid
        ? "Not analyzed"
        : d
          ? highRisk
            ? "Non-Compliant"
            : "Compliant"
          : "—",
    },
    { label: "Risk Level", value: !plot.isValid ? "Not analyzed" : (d?.riskLevel ?? "—") },
    { label: "Country", value: "Indonesia" },
    { label: "Centroid", value: `${centroid[1].toFixed(4)}, ${centroid[0].toFixed(4)}` },
    {
      label: "Analyzed",
      value: plot.eudr ? "Latest run" : plot.isValid ? "Pending" : "Skipped (invalid geometry)",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-extrabold text-slate-900">EUDR Analysis</h1>
      <Link
        href="/dashboard"
        className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        back to dashboard
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="h-[320px] lg:col-span-2">
          <PlotDisplayMap plots={[plot]} />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy">Plot Information</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            {info.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="text-sm font-semibold text-navy">{row.label}</dt>
                <dd className="truncate text-sm text-slate-500">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div
          role="tablist"
          aria-label="Analysis results"
          className="flex flex-wrap gap-6 border-b border-slate-100"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "border-navy text-navy"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl bg-teal-200/60 px-5 py-4">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-teal-700/40 text-teal-800">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold text-teal-900">{content.banner.title}</p>
            <p className="mt-1 text-sm text-teal-900/80">{content.banner.description}</p>
          </div>
        </div>

        {content.tiles.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.tiles.map((tile) => (
              <div key={tile.label} className="rounded-xl bg-slate-100 p-5">
                <p className="text-sm font-medium text-slate-500">{tile.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{tile.value}</p>
                {tile.sub && <p className="text-sm text-slate-400">{tile.sub}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-400">
            No data for this analysis — re-run the EUDR analysis from the dashboard.
          </p>
        )}
      </div>
    </div>
  );
}
