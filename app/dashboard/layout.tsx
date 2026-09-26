import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { billingSummary } from "@/lib/server/billing";

/** Server gate: the dashboard (and EUDR detail) is a paid-only feature. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  const billing = await billingSummary(session.uid);
  if (!billing.paid) redirect("/checkout");
  return <>{children}</>;
}
