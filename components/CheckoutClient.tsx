"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, Pencil } from "lucide-react";
import { usePlotStore } from "@/lib/plotStore";
import { markPaid } from "@/lib/usageClient";
import DashboardNavbar from "@/components/DashboardNavbar";

type PlanId = "payg" | "regular" | "pro";

type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  unit: string;
  lines?: string[];
  quota?: string;
  note?: string;
  features: string[];
};

const SHARED_FEATURES = [
  "EUDR compliance analysis",
  "Dashboard results",
  "GeoJSON upload & map draw",
  "PDF Export",
];

const PLANS: Plan[] = [
  {
    id: "payg",
    name: "PAY AS YOU GO",
    tagline: "For occasional users with no commitment",
    price: "14.9",
    unit: "/hectare",
    lines: [
      "No monthly fee. No quota.",
      "Pay only when you run an analysis",
      "Billed per hectare analyzed",
    ],
    features: SHARED_FEATURES,
  },
  {
    id: "regular",
    name: "REGULAR",
    tagline: "For teams with regular compliance needs",
    price: "49",
    unit: "/month",
    quota: "Includes 100 ha quota per month",
    note: "Unused quota does not roll over",
    features: SHARED_FEATURES,
  },
  {
    id: "pro",
    name: "Professional",
    tagline: "For organizations needing deep supply chain intelligence",
    price: "129",
    unit: "/month",
    quota: "Includes 500 ha quota per month",
    note: "Unused quota does not roll over",
    features: SHARED_FEATURES,
  },
];

const PAYG_RATE = 14.9;
const VOUCHER_CODE = "averoseudr";

export default function CheckoutClient() {
  const router = useRouter();
  const { plots, surveyDone } = usePlotStore();

  const totalArea = useMemo(
    () => plots.reduce((s, p) => s + p.areaHa, 0),
    [plots],
  );
  const totalPlots = plots.length;

  const [planId, setPlanId] = useState<PlanId>("payg");
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [showCvc, setShowCvc] = useState(false);

  const openSurvey = () => router.push("/survey?return=/checkout");
  const handlePay = async () => {
    await markPaid(); // unlocks dashboard + Excel export
    router.push("/dashboard");
  };

  const subtotal = planId === "payg" ? totalArea * PAYG_RATE : planId === "regular" ? 49 : 129;
  const discounted = voucherApplied || surveyDone;
  const total = discounted ? 0 : subtotal;

  const money = (n: number) => (n <= 0 ? "$0" : `$${n.toFixed(2)}`);

  const applyVoucher = () => {
    if (voucher.trim().toLowerCase() === VOUCHER_CODE) {
      setVoucherApplied(true);
      setVoucherError(null);
    } else {
      setVoucherApplied(false);
      setVoucherError("That voucher code isn't valid.");
    }
  };

  return (
    <>
      <DashboardNavbar />

      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:px-8">
          {/* Left: plan chooser */}
          <section className="rounded-2xl bg-navy-gradient p-6 text-white">
            <h1 className="text-2xl font-extrabold">Choose A Plan</h1>
            <div className="mt-6 space-y-5">
              {PLANS.map((plan) => {
                const active = plan.id === planId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanId(plan.id)}
                    aria-pressed={active}
                    className="block w-full rounded-2xl bg-white p-5 text-left text-slate-700 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          active ? "border-navy bg-navy text-white" : "border-slate-300"
                        }`}
                      >
                        {active && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold uppercase tracking-wide text-slate-800">
                              {plan.name}
                            </p>
                            <p className="text-xs text-slate-500">{plan.tagline}</p>
                          </div>
                          <p className="shrink-0 whitespace-nowrap text-sm text-slate-800">
                            <span className="text-xs align-top">$ </span>
                            <span className="text-lg font-bold">{plan.price}</span>
                            <span className="text-xs text-slate-400">{plan.unit}</span>
                          </p>
                        </div>

                        <div className="mt-3 space-y-1 border-b border-slate-100 pb-3 text-xs text-slate-600">
                          {plan.lines?.map((l) => <p key={l}>{l}</p>)}
                          {plan.quota && <p>{plan.quota}</p>}
                          {plan.note && (
                            <p className="font-semibold text-amber-600">{plan.note}</p>
                          )}
                        </div>

                        <ul className="mt-3 space-y-1 text-xs text-slate-500">
                          {plan.features.map((f) => <li key={f}>{f}</li>)}
                        </ul>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Right: voucher, survey, summary, payment */}
          <div className="space-y-6">
            {/* Voucher */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <label className="text-sm font-semibold text-navy">Voucher Code</label>
              <div className="mt-2 flex gap-3">
                <input
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                  readOnly={voucherApplied}
                  placeholder="Enter code"
                  className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-navy"
                />
                {voucherApplied ? (
                  <span className="flex items-center gap-1.5 rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy">
                    Applied <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={applyVoucher}
                    className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
                  >
                    Apply
                  </button>
                )}
              </div>
              {voucherError && (
                <p className="mt-2 text-xs font-medium text-red-500">{voucherError}</p>
              )}
            </div>

            {/* Summary + survey */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {/* Survey banner */}
              <div className="flex items-center justify-between gap-4 rounded-xl bg-teal-200/70 px-5 py-4">
                <div>
                  <p className="font-bold text-teal-900">
                    You don&apos;t have to pay if you fill the plot information
                  </p>
                  {surveyDone && (
                    <button
                      type="button"
                      onClick={openSurvey}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:underline"
                    >
                      Edit the survey <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
                {surveyDone ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={openSurvey}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
                  >
                    Fill Information <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <h2 className="mt-6 text-lg font-bold text-navy">Order summary</h2>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                  <span className="text-sm text-slate-500">Total Plot Area</span>
                  <span className="text-lg font-bold text-navy">
                    {totalArea.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                  <span className="text-sm text-slate-500">Total Plot</span>
                  <span className="text-lg font-bold text-navy">{totalPlots}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                {discounted && (
                  <>
                    <Row label="Subtotal" value={money(subtotal)} muted />
                    {voucherApplied ? (
                      <Row
                        label="Voucher Discount"
                        value={`-${money(subtotal)}`}
                        muted
                      />
                    ) : (
                      <Row
                        label="Survey Discount"
                        value={`-${money(subtotal)}`}
                        muted
                      />
                    )}
                  </>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium text-slate-600">Total due now</span>
                  <span className="text-2xl font-extrabold text-navy">
                    {money(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="inline-flex gap-2 rounded-lg bg-slate-100 px-4 py-3">
                <CardBadge label="MC" className="bg-orange-500" />
                <CardBadge label="VISA" className="bg-blue-700" />
                <CardBadge label="AMEX" className="bg-sky-500" />
                <CardBadge label="JCB" className="bg-green-600" />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Cardholder's Name">
                  <input placeholder="Enter your name" className={inputCls} />
                </Field>
                <Field label="Card Number">
                  <input
                    inputMode="numeric"
                    placeholder="Enter your card number"
                    className={inputCls}
                  />
                </Field>
                <Field label="Expire">
                  <input placeholder="MM/YY" className={inputCls} />
                </Field>
                <Field label="CVC">
                  <div className="relative">
                    <input
                      type={showCvc ? "text" : "password"}
                      inputMode="numeric"
                      placeholder="Enter the security code"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvc((v) => !v)}
                      aria-label={showCvc ? "Hide CVC" : "Show CVC"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCvc ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handlePay}
                  className="rounded-lg bg-navy px-8 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
                >
                  Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-navy";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={muted ? "font-medium text-navy" : "text-navy"}>{value}</span>
    </div>
  );
}

function CardBadge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`flex h-6 items-center rounded px-1.5 text-[10px] font-bold text-white ${className}`}
    >
      {label}
    </span>
  );
}

