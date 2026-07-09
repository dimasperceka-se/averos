import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Privacy Policy — Averos",
  description: "Averos policies, terms, and conditions.",
};

type Section = { id?: string; heading: string; body: string };

const SECTIONS: Section[] = [
  {
    heading: "About Averos",
    body: "Averos provides spatial data verification, plantation mapping, traceability support, field data acquisition, and related digital solutions for agriculture, sustainability, and supply chain management. Information presented on this website is intended for general business and service information purposes only.",
  },
  {
    heading: "Use of Website and Services",
    body: "You agree to use this website and our services only for lawful, professional, and authorized purposes. You must not misuse the website, attempt unauthorized access, interfere with system security, copy or reproduce protected materials without permission, or use our services in a way that may harm Averos, our clients, partners, or third parties.",
  },
  {
    heading: "Data and Information Submitted",
    body: "Any data, documents, coordinates, polygons, maps, images, survey results, or other information submitted to Averos must be accurate, lawful, and authorized for use. You are responsible for ensuring that you have the right to share such information with us. Averos may use submitted information solely for the purpose of delivering agreed services, technical assessment, proposal preparation, verification, reporting, or communication with you.",
  },
  {
    id: "security",
    heading: "Privacy and Confidentiality",
    body: "Averos respects the confidentiality of client and user information. We will take reasonable measures to protect personal, business, and spatial data provided to us. We do not sell user data to third parties. Any confidential project data, including farm boundaries, GPS points, supply chain information, and operational records, will be handled with care and used only for the intended business purpose, unless otherwise required by law or agreed in writing.",
  },
  {
    heading: "Intellectual Property",
    body: "We aim to keep website information accurate and up to date. However, Averos does not guarantee that all content is free from errors, omissions, or outdated information. Service availability, features, pricing, timelines, and technical specifications may change without prior notice. Any final scope, deliverables, fees, and responsibilities will be governed by a separate proposal, agreement, quotation, or contract.",
  },
  {
    heading: "Third-Party Tools and Links",
    body: "Our website or services may refer to third-party platforms, tools, datasets, maps, APIs, satellite imagery, or external websites. Averos is not responsible for the accuracy, availability, security, or policies of third-party services. Your use of third-party services may be subject to their own terms and conditions.",
  },
  {
    heading: "Limitation of Liability",
    body: "To the maximum extent permitted by applicable law, Averos shall not be liable for any indirect, incidental, consequential, or business losses arising from the use of this website, reliance on website information, technical interruptions, or the use of third-party data and services. Any liability related to paid services shall be limited to the terms stated in the applicable written agreement between Averos and the client.",
  },
  {
    heading: "User Responsibilities",
    body: "Users and clients are responsible for providing accurate information, maintaining the confidentiality of account credentials where applicable, ensuring legal rights over submitted data, reviewing outputs before operational or regulatory use, and complying with relevant laws, regulations, and industry standards.",
  },
  {
    heading: "Changes to These Terms",
    body: "Averos may update these Policies, Terms & Conditions from time to time. Any updates will be posted on this page with the latest revision date. Continued use of our website or services after changes are published means you accept the updated terms.",
  },
  {
    heading: "Contact",
    body: "For questions regarding these Policies, Terms & Conditions, or to request clarification about how your data is handled, please contact Averos through the official contact information provided on our website.",
  },
];

export default async function PrivacyPage() {
  const session = await getSession();
  return (
    <>
      <Navbar authed={!!session} userName={session?.name} />

      {/* Title band */}
      <div className="bg-navy-gradient">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            PRIVACY POLICY
          </h1>
        </div>
      </div>

      <main className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-navy">Welcome to Averos.</h2>
          <p className="mt-6 leading-relaxed text-slate-600">
            Welcome to Averos. By accessing or using our website, platform,
            services, or any related materials, you agree to comply with the
            following policies, terms, and conditions. Please read them carefully
            before using our services.
          </p>

          <div className="mt-10 space-y-8">
            {SECTIONS.map((s) => (
              <section key={s.heading} id={s.id} className="scroll-mt-24">
                <h3 className="text-base font-bold text-slate-900">{s.heading}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{s.body}</p>
              </section>
            ))}
          </div>

          <p className="mt-12 text-sm text-slate-700">
            <span className="font-bold">Last updated:</span> Jakarta, June 19th 2026
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
