import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import DashboardNavbar from "@/components/DashboardNavbar";
import AppTabs from "@/components/AppTabs";

export const metadata = { title: "AgriPlot — Averos" };

// The AgriPlot map is served by the sustainit app on the same VM.
const AGRIPLOT_URL = "https://app.sustainit.id/agri-plot-map";

export default async function AgriPlotPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/agriplot");

  return (
    <div className="flex h-screen flex-col">
      <DashboardNavbar />
      <AppTabs />
      <iframe
        src={AGRIPLOT_URL}
        title="AgriPlot Map"
        className="min-h-0 w-full flex-1 border-0"
        allow="geolocation; clipboard-write"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
