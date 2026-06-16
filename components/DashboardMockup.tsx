import Image from "next/image";
import { Check, CheckCircle2, FileJson, Sparkles, Zap } from "lucide-react";
import {
  dashboardAccountNav,
  dashboardInsights,
  dashboardNav,
  dashboardResultTiles,
} from "@/lib/data";

/* A pure HTML/CSS product mockup — no screenshots. Shown inside the
   "See exactly what you'll get" section. */
export default function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded-md bg-white px-3 py-1 text-center text-[11px] text-slate-400 ring-1 ring-slate-200">
          app.averos.io/dashboard/results
        </div>
      </div>

      {/* App body */}
      <div className="flex min-h-[460px] text-left">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 flex-col bg-navy-deep p-4 text-slate-300 sm:flex">
          <Image
            src="/AVEROS-logo-light.png"
            alt="Averos"
            width={2254}
            height={771}
            className="h-5 w-auto px-1"
          />

          <nav className="mt-6 space-y-1" aria-label="Dashboard">
            {dashboardNav.map((item) => (
              <span
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium ${
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-slate-400"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </nav>

          <p className="mt-6 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Account
          </p>
          <nav className="mt-1 space-y-1" aria-label="Account">
            {dashboardAccountNav.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400"
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </nav>

          <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
              <Zap className="h-3 w-3" aria-hidden="true" />
              Free Plan
            </span>
            <p className="mt-1 text-[10px] leading-snug text-slate-400">
              Upgrade to unlock AI Insights
            </p>
          </div>
        </aside>

        {/* Main panel */}
        <div className="flex-1 space-y-4 bg-slate-50 p-5">
          <div>
            <h3 className="text-lg font-bold text-navy">Analysis Results</h3>
            <p className="text-[11px] text-slate-400">
              Rainfall · Deforestation · 2 analyses · Just now
            </p>
          </div>

          {/* File row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs">
            <FileJson className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
            <span className="font-semibold text-navy">kebun_sawit_riau.geojson</span>
            <span className="text-slate-400">3 polygons</span>
            <span className="text-slate-400">247.3 ha total</span>
            <span className="ml-auto flex items-center gap-1 font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Geometry valid
            </span>
          </div>

          {/* Result tiles */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dashboardResultTiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {tile.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tile.badgeTint}`}
                  >
                    {tile.badge}
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold text-navy">{tile.value}</p>
                <p className="text-[11px] text-slate-400">{tile.caption}</p>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div className="rounded-lg bg-navy-gradient p-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-bold">AI Insights</span>
              <span className="rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                Premium
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {dashboardInsights.map((insight) => (
                <li key={insight} className="flex gap-2 text-[11px] leading-snug text-slate-200">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-slate-400">Report generated · May 17, 2026</span>
            <span className="font-semibold text-navy">Share report →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
