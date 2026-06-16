import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AnalysisTypes from "@/components/AnalysisTypes";
import ComingSoon from "@/components/ComingSoon";
import WhatYouGet from "@/components/WhatYouGet";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/server/session";

export default async function Home() {
  const session = await getSession();
  return (
    <>
      <Navbar authed={!!session} userName={session?.name} />
      <main>
        <Hero />
        <AnalysisTypes authed={!!session} />
        <ComingSoon />
        <WhatYouGet />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
