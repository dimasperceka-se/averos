import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { findById } from "@/lib/server/userStore";

/** Server gate: the dashboard (and EUDR detail) is a paid-only feature. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  const user = await findById(session.uid);
  if (!user?.paid) redirect("/checkout");
  return <>{children}</>;
}
