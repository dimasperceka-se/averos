import { valueCards } from "@/lib/data";
import DashboardMockup from "./DashboardMockup";

export default function WhatYouGet() {
  return (
    <section id="use-cases" className="bg-navy-gradient text-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          See exactly what you&apos;ll get.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-300">
          Every analysis delivers a clear, structured report inside your
          dashboard — with AI-powered insights and a one-click PDF export.
        </p>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-5">
          {/* Dashboard mockup */}
          <div className="lg:col-span-3">
            <DashboardMockup />
          </div>

          {/* Value cards */}
          <ul className="space-y-4 lg:col-span-2">
            {valueCards.map((card) => (
              <li
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-navy">
                    <card.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-navy">
                        {card.title}
                      </h3>
                      {card.premium && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
