"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { usePlotStore } from "@/lib/plotStore";
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

type Quote = { amount: string; currency: string; areaHa: number; count: number; quotaHa: number | null; exceedsQuota: boolean };
type Subscription = { id: string; plan: string; status: string; active: boolean; expiresAt?: number; remainingHa: number };

async function paymentRequest(body: unknown) {
  const response = await fetch("/api/paypal/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Payment request failed.");
  return result;
}

export default function CheckoutClient() {
  const { plots } = usePlotStore();
  const [planId, setPlanId] = useState<PlanId>("payg");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [environment, setEnvironment] = useState("");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [cancelled, setCancelled] = useState(false);
  const requestId = useRef("");
  const geometry = JSON.stringify(plots.filter(p => p.isValid).map(p => ({ ring: p.ring })));

  const refreshBilling = async () => {
    const res = await fetch("/api/paypal/checkout", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setEnvironment(data.environment); setSubscriptions(data.subscriptions);
  };
  useEffect(() => {
    setCancelled(new URLSearchParams(window.location.search).has("cancelled"));
    refreshBilling().catch(e => setError(e.message));
  }, []);
  useEffect(() => {
    let current = true;
    setQuote(null); setError(""); requestId.current = crypto.randomUUID();
    paymentRequest({ action: "quote", plan: planId, plots: JSON.parse(geometry) })
      .then(data => { if (current) setQuote(data); })
      .catch(e => { if (current) setError(e.message); });
    return () => { current = false; };
  }, [planId, geometry]);

  const pay = async () => {
    if (!quote || busy) return;
    setBusy(true); setError("");
    try {
      const key = "averos.checkout." + planId + "." + quote.amount + "." + geometry;
      // Keep idempotency across reloads and interrupted redirects.
      const previous = sessionStorage.getItem(key);
      if (previous) requestId.current = previous;
      else sessionStorage.setItem(key, requestId.current);
      const data = await paymentRequest({ action: "create", plan: planId, plots: JSON.parse(geometry), amount: quote.amount, requestId: requestId.current });
      window.location.assign(data.approvalUrl);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  };
  const cancel = async (id: string) => {
    if (!window.confirm("Cancel this subscription? Completed paid periods remain available until they expire.")) return;
    setBusy(true); setError("");
    try { await paymentRequest({ action: "cancel", id }); await refreshBilling(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  const resume = async (id: string) => {
    setBusy(true); setError("");
    try {
      const data = await paymentRequest({ action: "resume", id });
      window.location.assign(data.approvalUrl);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  };

  return <>
    <DashboardNavbar />
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:px-8">
        <section className="rounded-2xl bg-navy-gradient p-6 text-white">
          <h1 className="text-2xl font-extrabold">Choose a plan</h1>
          <div className="mt-6 space-y-5">
            {PLANS.map(plan => <button key={plan.id} type="button" disabled={busy} onClick={() => setPlanId(plan.id)} aria-pressed={planId === plan.id} className="block w-full rounded-2xl bg-white p-5 text-left text-slate-700 shadow-sm disabled:opacity-60">
              <div className="flex gap-3">
                <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${planId === plan.id ? "border-navy bg-navy text-white" : "border-slate-300"}`}>{planId === plan.id && <Check className="h-3 w-3" />}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase">{plan.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{plan.tagline}</p>
                  <p className="mt-3"><strong className="text-2xl">${plan.price}</strong> <span className="text-sm">USD{plan.unit}</span></p>
                  <div className="mt-3 space-y-1 border-b border-slate-100 pb-3 text-xs">
                    {plan.lines?.map(line => <p key={line}>{line}</p>)}
                    {plan.quota && <p>{plan.quota}</p>}
                    {plan.note && <p className="text-amber-700">{plan.note}</p>}
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-slate-500">{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
                </div>
              </div>
            </button>)}
          </div>
        </section>
        <div className="space-y-6">
          {environment === "sandbox" && <p className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">Sandbox testing — use a PayPal Sandbox personal account. No real money is charged.</p>}
          {cancelled && <p role="status" className="rounded-xl bg-white p-5 text-slate-700">You returned without completing checkout. You can try again below.</p>}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Valid plots</span><strong>{quote?.count ?? "—"}</strong></div>
              <div className="flex justify-between"><span>Area calculated from your plots</span><strong>{quote ? quote.areaHa.toFixed(4) + " ha" : "—"}</strong></div>
              <div className="flex justify-between border-t pt-4"><span>Total due now</span><strong className="text-2xl text-navy">{quote ? "$" + quote.amount + " USD" : "—"}</strong></div>
              {quote?.exceedsQuota && <p className="rounded-lg bg-amber-50 p-3 text-amber-900">Your selected plots ({quote.areaHa.toFixed(2)} ha) exceed this plan’s {quote.quotaHa} ha monthly quota, so they can’t all be analysed under it. You can still subscribe and analyse up to {quote.quotaHa} ha each month.</p>}
              {planId !== "payg" && <p>Renews automatically at ${planId === "regular" ? "49" : "129"} USD each month until cancelled. Cancel below or in your PayPal account.</p>}
              {planId === "payg" && <p>One-time payment covering analysis of the selected plots.</p>}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy">Pay securely with PayPal</h2>
            <p className="mt-2 text-sm text-slate-600">Review and approve your payment on PayPal. You’ll return to Averos when finished.</p>
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="button" disabled={!quote || busy} onClick={pay} className="mt-6 w-full rounded-lg bg-[#ffc439] px-6 py-3 font-bold text-[#003087] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Please wait…" : "Continue to PayPal"}</button>
          </section>
          {!!subscriptions.length && <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-navy">Your subscriptions</h2>
            {subscriptions.map(s => <div key={s.id} className="mt-4 border-t pt-4 text-sm text-slate-700">
              <p className="font-semibold capitalize">{s.plan} — {s.status.toLowerCase().replaceAll("_", " ")}</p>
              {s.active && <p className="mt-1">{s.remainingHa.toFixed(2)} ha remaining. Paid access until {new Date(s.expiresAt!).toLocaleDateString()}.</p>}
              {s.status === "APPROVAL_PENDING" && <button disabled={busy} onClick={() => resume(s.id)} className="mt-2 mr-4 font-semibold text-navy underline">Resume checkout</button>}
              {!["CANCELLED", "EXPIRED"].includes(s.status) && <button disabled={busy} onClick={() => cancel(s.id)} className="mt-2 font-semibold text-red-700 underline">Cancel subscription</button>}
            </div>)}
          </section>}
        </div>
      </div>
    </main>
  </>;
}
