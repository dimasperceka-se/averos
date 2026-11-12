"use client";

import { useEffect, useState } from "react";
import type { EuisIdentityView } from "@/lib/ddsShared";
import { ddsApi, environmentLabel, formatDateTime } from "@/lib/ddsClient";
import { ui } from "@/components/dds/ui";

type IdentityData = { identity: EuisIdentityView | null; environment: "acceptance" | "mock" };

// Label and its "(optional)" note share one line, so inputs in a row line up.
const field =
  "block text-[13px] font-semibold text-slate-900 [&>input]:mt-1.5 [&>select]:mt-1.5 [&>textarea]:mt-1.5 [&>input+span]:mt-1.5 [&>input+span]:block [&>select+span]:mt-1.5 [&>select+span]:block [&>textarea+span]:mt-1.5 [&>textarea+span]:block";
const input = "min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-normal text-slate-900 outline-none focus:border-navy";
const hint = "text-[12px] font-normal text-slate-500";

/**
 * EUIS Acceptance identity for DDS Submission. The values come from the EUDR
 * Information System profile ("Edit Profile" → username; "Web Services Access" →
 * authentication key and client identifier). The key is write-only here.
 */
export default function EuisConnection({ onChange }: { onChange?: () => void }) {
  const [data, setData] = useState<IdentityData | null>(null);
  const [form, setForm] = useState({ name: "", username: "", clientId: "", operatorAccessId: "", authKey: "" });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "test" | "remove">("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const fill = (d: IdentityData) => {
    setData(d);
    const i = d.identity;
    setForm({ name: i?.name ?? "", username: i?.username ?? "", clientId: i?.clientId ?? "", operatorAccessId: i?.operatorAccessId ?? "", authKey: "" });
    setEditing(!i);
  };

  useEffect(() => {
    void ddsApi<IdentityData>("/api/euis/identity").then((res) => {
      if (res.ok) fill(res.data);
      else setNotice({ ok: false, text: res.error.error });
    });
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("save");
    setNotice(null);
    const res = await ddsApi<IdentityData>("/api/euis/identity", "PUT", form);
    setBusy("");
    if (res.ok) {
      fill(res.data);
      setNotice({ ok: true, text: "EUIS connection saved. Run the connection test to check it." });
      onChange?.();
    } else setNotice({ ok: false, text: res.error.error });
  };

  const test = async () => {
    setBusy("test");
    setNotice(null);
    const res = await ddsApi<{ ok: boolean; message: string }>("/api/euis/identity/test", "POST");
    if (res.ok) setNotice({ ok: res.data.ok, text: res.data.ok ? `Connected. ${res.data.message}` : `Connection failed: ${res.data.message}` });
    else setNotice({ ok: false, text: res.error.error });
    const again = await ddsApi<IdentityData>("/api/euis/identity");
    if (again.ok) setData(again.data);
    setBusy("");
  };

  const remove = async () => {
    if (!window.confirm("Remove the EUIS connection from Averos?")) return;
    setBusy("remove");
    const res = await ddsApi<IdentityData>("/api/euis/identity", "DELETE");
    setBusy("");
    if (res.ok) {
      fill({ identity: null, environment: data?.environment ?? "acceptance" });
      setNotice({ ok: true, text: "EUIS connection removed." });
      onChange?.();
    } else setNotice({ ok: false, text: res.error.error });
  };

  const identity = data?.identity;

  return (
    <section id="euis" aria-labelledby="euis-h" className={`${ui.card} flex scroll-mt-6 flex-col gap-4 p-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="euis-h" className="m-0 text-xl font-bold text-slate-900">
          EUIS connection
        </h2>
        <span className="text-[13px] text-slate-500">{data ? environmentLabel(data.environment) : "Loading…"}</span>
      </div>
      <p className="m-0 text-[14px] leading-[1.6] text-slate-600">
        Used to file statements in the EU Information System (TRACES), Acceptance environment only. In your EUDR profile, &quot;Edit
        Profile&quot; shows the username and the &quot;Web Services Access&quot; section shows the authentication key and client identifier. The key is stored
        encrypted and never shown again.
      </p>

      {identity && !editing && (
        <>
          <dl className="m-0 grid gap-4 sm:grid-cols-2">
            {[
              ["Name", identity.name],
              ["Web-service username", identity.username],
              ["WebServiceClientId", identity.clientId],
              ["Authentication key", "•••••••• (saved)"],
              ...(identity.operatorAccessId ? [["Web Service Access Identifier", identity.operatorAccessId]] : []),
              [
                "Last connection test",
                identity.lastTest ? `${identity.lastTest.ok ? "Passed" : "Failed"} · ${formatDateTime(identity.lastTest.at)}` : "Not run yet",
              ],
            ].map(([k, v]) => (
              <div key={k} className="flex min-w-0 flex-col gap-1">
                <dt className="text-[13px] text-slate-500">{k}</dt>
                <dd className="m-0 font-semibold break-all">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={test} disabled={busy !== ""} className={ui.btnDark}>
              {busy === "test" ? "Testing…" : "Test connection"}
            </button>
            <button type="button" onClick={() => setEditing(true)} disabled={busy !== ""} className={ui.btnOutline}>
              Edit
            </button>
            <button type="button" onClick={remove} disabled={busy !== ""} className="text-[13px] font-semibold text-slate-600 hover:text-red-800">
              Remove
            </button>
          </div>
        </>
      )}

      {editing && data && (
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <label className={field}>
            Name <span className={hint}>(optional, for your reference)</span>
            <input className={input} maxLength={100} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className={field}>
            Web-service username
            <input className={input} required maxLength={100} autoComplete="off" value={form.username} onChange={(e) => set("username", e.target.value)} />
          </label>
          <label className={field}>
            Authentication key
            <input
              className={input}
              type="password"
              required={!identity}
              maxLength={500}
              autoComplete="new-password"
              value={form.authKey}
              placeholder={identity ? "Leave empty to keep the saved key" : ""}
              onChange={(e) => set("authKey", e.target.value)}
            />
          </label>
          <label className={field}>
            WebServiceClientId
            <input className={input} required maxLength={100} autoComplete="off" value={form.clientId} onChange={(e) => set("clientId", e.target.value)} />
            <span className={hint}>Your client identifier from Web Services Access.</span>
          </label>
          <label className={`${field} sm:col-span-2`}>
            Web Service Access Identifier <span className={hint}>(optional)</span>
            <input className={input} maxLength={32} autoComplete="off" value={form.operatorAccessId} onChange={(e) => set("operatorAccessId", e.target.value)} />
            <span className={hint}>Only if your web-service user is linked to more than one operator.</span>
          </label>
          <div className="flex flex-wrap items-center gap-2.5 sm:col-span-2">
            <button type="submit" disabled={busy !== ""} className={ui.btnDark}>
              {busy === "save" ? "Saving…" : "Save connection"}
            </button>
            {identity && (
              <button type="button" onClick={() => fill(data)} disabled={busy !== ""} className={ui.btnOutline}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {notice && (
        <p role={notice.ok ? "status" : "alert"} className={`m-0 text-[14px] ${notice.ok ? "text-emerald-700" : "text-red-700"}`}>
          {notice.text}
        </p>
      )}
    </section>
  );
}
