import { ArrowRight, Check } from "lucide-react";
import { pricingTiers } from "@/lib/data";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[#F7F8FA]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-3xl font-extrabold text-navy sm:text-4xl">
          Pay for what you actually analyze.
        </h2>
        <p className="mt-3 text-slate-500">
          Start with pay-as-you-go, or subscribe for better rates and more
          features.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
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
                    {tier.currency}
                  </span>
                  <span className="text-5xl font-extrabold leading-none text-navy">
                    {tier.amount}
                  </span>
                  <span className="mt-auto pb-1 text-sm font-medium text-slate-400">
                    {tier.unit}
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
              {tier.callout && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                  <p className="text-xs font-semibold text-amber-800">
                    {tier.callout.highlight}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-amber-600">
                    {tier.callout.sub}
                  </p>
                </div>
              )}

              <hr className="my-6 border-slate-100" />

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature) => (
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
          ))}
        </div>

        {/* Free-trial banner */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-teal-300 to-emerald-400 px-6 py-14 text-center">
          <h3 className="text-3xl font-extrabold text-navy sm:text-4xl">
            Analyze your first plot for free.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-navy/80">
            Upload 1 plot (up to 4 hectares) and complete the assessment to
            receive your first land analysis at no cost.
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
              href="mailto:contact@averos.land"
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
