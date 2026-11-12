import Link from "next/link";
import EudrSidebar from "@/components/EudrSidebar";
import { getSession } from "@/lib/server/session";
import { findById } from "@/lib/server/userStore";
import { ddsAllowed } from "@/lib/server/ddsAccess";

export default async function DdsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const account = session ? await findById(session.uid) : null;
  const allowed = ddsAllowed(account?.email);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <EudrSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6 lg:p-8">
          {allowed ? (
            children
          ) : (
            <section className="flex flex-col gap-3 rounded-2xl bg-white p-8 shadow-sm">
              <span className="w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">Soon</span>
              <h1 className="m-0 text-3xl font-extrabold text-slate-900">DDS Submission</h1>
              <p className="m-0 max-w-[640px] text-sm leading-relaxed text-slate-600">
                Filing Due Diligence Statements with the EU Information System from Averos is coming soon. Until then you can export a
                DDS as PDF from your dashboard.
              </p>
              <Link href="/dashboard" className="w-fit text-sm font-semibold text-navy hover:underline">
                ← Back to dashboard
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
