"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { CURRENCIES, pricingTiers, type CurrencyKey } from "@/lib/data";
import { FREE_QUOTA_HA } from "@/lib/quota";

const CURRENCY_KEYS: CurrencyKey[] = ["idr", "usd"];

export default function Pricing() {
  const [cur, setCur] = useState<CurrencyKey>("idr");

  return (
    <section id="pricing" className="bg-[#F7F8FA]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-navy sm:text-4xl">
              Pay for what you actually analyze.
            </h2>
            <p className="mt-3 text-slate-500">
              Start with pay-as-you-go, or subscribe for better rates and more
              features.
            </p>
          </div>

          {/* Currency toggle */}
          <div
            role="group"
            aria-label="Currency"
            className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-white p-1"
          >
            {CURRENCY_KEYS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCur(c)}
                aria-pressed={cur === c}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  cur === c
                    ? "bg-navy text-white"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                {CURRENCIES[c].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => {
            const price = tier[cur];
            const symbol = CURRENCIES[cur].symbol;
            const callout = tier.callout?.[cur];
            const features = tier.overage
              ? [...tier.features, tier.overage[cur]]
              : tier.features;
            return (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl bg-white p-8 ${
                  tier.featured
                    ? "border-2 border-accent shadow-lg lg:-mt-4"
                    : "border border-slate-200 shadow-sm"
                }`}
              >
                {/* Header */}
                <div className="text-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-navy">
                    {tier.name}
                  </h3>
                  <p className="mx-auto mt-2 min-h-[40px] max-w-[16rem] text-xs leading-relaxed text-slate-500">
                    {tier.tagline}
                  </p>
                </div>

                <hr className="my-6 border-slate-100" />

                {/* Price */}
                <div className="text-center">
                  <p className="flex items-start justify-center gap-0.5">
                    <span className="mt-1 text-lg font-semibold text-navy">
                      {symbol}
                    </span>
                    <span className="text-5xl font-extrabold leading-none text-navy">
                      {price.amount}
                    </span>
                    <span className="mt-auto pb-1 text-sm font-medium text-slate-400">
                      {price.unit}
                    </span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {tier.sub}
                  </p>
                </div>

                {/* Extra descriptive lines (pay-as-you-go) */}
                {tier.lines && (
                  <div className="mt-6 text-center text-xs leading-relaxed text-slate-500">
                    {tier.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                )}

                {/* Amber extra-usage callout */}
                {callout && (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                    <p className="text-xs font-semibold text-amber-800">
                      {callout}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-amber-600">
                      {tier.callout!.sub}
                    </p>
                  </div>
                )}

                <hr className="my-6 border-slate-100" />

                {/* Features */}
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-slate-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Free-trial banner */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-teal-300 to-emerald-400 px-6 py-14 text-center">
          <h3 className="text-3xl font-extrabold text-navy sm:text-4xl">
            Analyze your first {FREE_QUOTA_HA} hectares for free.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-navy/80">
            Upload one plot or several — up to {FREE_QUOTA_HA} hectares in total — and
            receive your land analysis at no cost.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-mid"
            >
              Start free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="/contact"
              className="rounded-lg border border-navy/40 px-6 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-white/40"
            >
              Contact Our Team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
