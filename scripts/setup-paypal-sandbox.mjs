import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";

if (process.env.PAYPAL_ENV !== "sandbox") throw new Error("This script only provisions Sandbox plans.");
const base = "https://api-m.sandbox.paypal.com";
const auth = await fetch(base + "/v1/oauth2/token", {
  method: "POST", headers: { Authorization: "Basic " + Buffer.from(process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials",
});
if (!auth.ok) throw new Error("PayPal authentication failed: " + auth.status);
const token = (await auth.json()).access_token;
async function api(endpoint, body, requestId) {
  const response = await fetch(base + endpoint, { method: body ? "POST" : "GET", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", ...(requestId ? { "PayPal-Request-Id": requestId } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify({ status: response.status, name: data.name, details: data.details }));
  return data;
}
await mkdir(".data", { recursive: true });
const file = ".data/paypal-sandbox-setup.json";
let setup;
try { setup = JSON.parse(await readFile(file, "utf8")); }
catch (e) { if (e.code !== "ENOENT") throw e; setup = { productRequest: randomUUID(), regularRequest: randomUUID(), proRequest: randomUUID() }; }
const save = () => writeFile(file, JSON.stringify(setup, null, 2), { mode: 0o600 });
await save();
if (!setup.productId) {
  const product = await api("/v1/catalogs/products", { name: "Averos land analysis", description: "Monthly land compliance analysis", type: "SERVICE", category: "SOFTWARE" }, setup.productRequest);
  setup.productId = product.id; await save();
}
for (const [key, name, price] of [["regular", "Averos Regular — 100 ha/month", "49.00"], ["pro", "Averos Professional — 500 ha/month", "129.00"]]) {
  const envKey = key === "regular" ? "PAYPAL_PLAN_REGULAR_ID" : "PAYPAL_PLAN_PRO_ID";
  let id = process.env[envKey] || setup[key + "Id"];
  if (!id) {
    const plan = await api("/v1/billing/plans", {
      product_id: setup.productId, name, status: "ACTIVE",
      billing_cycles: [{ frequency: { interval_unit: "MONTH", interval_count: 1 }, tenure_type: "REGULAR", sequence: 1, total_cycles: 0, pricing_scheme: { fixed_price: { value: price, currency_code: "USD" } } }],
      payment_preferences: { auto_bill_outstanding: false, payment_failure_threshold: 1 },
    }, setup[key + "Request"]);
    id = plan.id; setup[key + "Id"] = id; await save();
  }
  const details = await api("/v1/billing/plans/" + encodeURIComponent(id));
  const cycles = details.billing_cycles;
  if (details.status !== "ACTIVE" || cycles?.length !== 1 || cycles[0].frequency.interval_unit !== "MONTH" || cycles[0].frequency.interval_count !== 1 || Number(cycles[0].pricing_scheme.fixed_price.value) !== Number(price) || cycles[0].pricing_scheme.fixed_price.currency_code !== "USD") throw new Error("Plan pricing mismatch: " + key);
  let env = await readFile(".env", "utf8");
  const line = envKey + "=" + id;
  env = new RegExp("^" + envKey + "=.*$", "m").test(env) ? env.replace(new RegExp("^" + envKey + "=.*$", "m"), line) : env + "\n" + line + "\n";
  await writeFile(".env", env);
  console.log(key + ": configured and verified (USD " + price + "/month)");
}
let env = await readFile(".env", "utf8");
if (!/^PAYPAL_RETURN_BASE=/m.test(env)) await writeFile(".env", env + "\nPAYPAL_RETURN_BASE=http://localhost:3001\n");
