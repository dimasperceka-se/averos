# PayPal payments (local)

Checkout lives in `lib/server/billing.ts` and the `/api/paypal/checkout` route:
pay-as-you-go is a one-time PayPal order captured on `/checkout/return`;
Regular and Professional are monthly PayPal subscriptions. Entitlements are kept
in the ignored `.data/billing/<environment>/ledger.json` ledger.

The Node route `/api/paypal/webhook` verifies incoming signatures using PayPal's
verification API, re-reads the matching purchase from PayPal to update the
ledger (activation, renewals, refunds, reversals, cancellations), then saves the
event under `.data/paypal-webhooks/<environment>/`. Repeated event IDs are
ignored. The return page is the primary confirmation path; the webhook keeps
state current afterwards (renewals, refunds, cancellations made in PayPal).

Set `PAYPAL_ENV` (`sandbox` or `live`), `PAYPAL_CLIENT_ID`,
`PAYPAL_CLIENT_SECRET`, and, after dashboard registration, `PAYPAL_WEBHOOK_ID`.
All values must belong to the same PayPal environment and app. In Sandbox,
`node --env-file=.env scripts/setup-paypal-sandbox.mjs` creates the product and
the two plans and writes `PAYPAL_PLAN_REGULAR_ID` / `PAYPAL_PLAN_PRO_ID`.

Subscribe the webhook to: `BILLING.SUBSCRIPTION.ACTIVATED`, `.CANCELLED`,
`.EXPIRED`, `.PAYMENT.FAILED`, `.SUSPENDED`, `.UPDATED`;
`PAYMENT.CAPTURE.COMPLETED`, `.DECLINED`, `.PENDING`, `.REFUNDED`, `.REVERSED`;
`PAYMENT.SALE.COMPLETED`, `.REFUNDED`, `.REVERSED`.

Run these in separate terminals:

```sh
npm run dev -- --port 3001
node scripts/paypal-webhook-proxy.mjs
cloudflared tunnel --url http://127.0.0.1:3002 --no-autoupdate
```

The proxy exposes only GET/POST `/api/paypal/webhook`; other paths return 404.
Set `WEBHOOK_UPSTREAM` to change the Next.js origin if needed.

Register `https://<tunnel-host>/api/paypal/webhook` in the PayPal app dashboard.
Copy the returned Webhook ID to `.env` and restart Next.js if necessary.
GET returning `reachable` only checks connectivity; POST requires configuration
and a valid PayPal signature. Missing configuration or upstream/storage failure
returns 503 so PayPal retries. Invalid signatures return 401.

Open the app at `http://localhost:3001` (not 127.0.0.1) so the session cookie
matches `PAYPAL_RETURN_BASE` when PayPal sends the buyer back. Pay with a
Sandbox **personal** account (developer.paypal.com → Testing Tools → Sandbox
Accounts); no real money moves.

Quick Tunnel URLs change when recreated and require these processes and this
computer to remain running. When the URL changes, edit the webhook URL in the
PayPal dashboard (the Webhook ID stays the same). Use a stable deployed HTTPS
URL for production, with live credentials, live plans and a live webhook ID.
PayPal's mock webhook simulator cannot be verified with the postback verification
API used here; use real sandbox transactions for end-to-end verification.
