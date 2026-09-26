import {
  BarChart3,
  Cloud,
  CloudRain,
  Factory,
  FileText,
  Flame,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  type LucideIcon,
  Map,
  Settings,
  ShieldCheck,
  Sprout,
  TreePine,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Spatial Analysis", href: "/#features" },
  { label: "Averos Pricing", href: "/#pricing" },
];

/* -------------------------------------------------------------------------- */
/*  Hero floating data chips                                                  */
/* -------------------------------------------------------------------------- */

export type HeroChip = {
  icon: LucideIcon;
  label: string;
  value: string;
  /* Tailwind classes for the chip's icon tile tint. */
  tint: string;
  /* Absolute-position classes that place the chip over the satellite image. */
  position: string;
};

export const heroChips: HeroChip[] = [
  {
    icon: Flame,
    label: "Fire Alert",
    value: "ON",
    tint: "bg-orange-500/20 text-orange-400",
    position: "top-[14%] right-[6%]",
  },
  {
    icon: CloudRain,
    label: "Annual Rainfall",
    value: "1,280 mm",
    tint: "bg-sky-500/20 text-sky-300",
    position: "top-[34%] left-[2%]",
  },
  {
    icon: TreePine,
    label: "Deforestation",
    value: "Low",
    tint: "bg-emerald-500/20 text-emerald-300",
    position: "top-[52%] right-[4%]",
  },
];

/* -------------------------------------------------------------------------- */
/*  EUDR compliance analyses (live)                                           */
/* -------------------------------------------------------------------------- */

/** Analysis identifiers; `endpoint` maps to the FastAPI route /api/v1/<endpoint>. */
export type AnalysisKey = "deforestation" | "legality" | "ghg" | "rainfall";

export type AnalysisType = {
  key: AnalysisKey;
  endpoint: string;
  icon: LucideIcon;
  title: string;
  caption: string;
  description: string;
  /* Tailwind classes for the pastel icon tile (background + icon color). */
  tile: string;
};

export const eudrAnalyses: AnalysisType[] = [
  {
    key: "deforestation",
    endpoint: "deforestation",
    icon: TreePine,
    title: "Deforestation Analysis",
    caption: "Forest loss detection",
    description:
      "Identify tree cover loss within your plot boundaries using satellite-verified data, aligned with EUDR baselines.",
    tile: "bg-emerald-100 text-emerald-600",
  },
  {
    key: "legality",
    endpoint: "protected-area",
    icon: ShieldCheck,
    title: "Land Legality Analysis",
    caption: "Conservation zone check",
    description:
      "Check for overlaps with national parks, wildlife reserves, and conservation zones — with exact distance and area reported.",
    tile: "bg-pink-100 text-pink-600",
  },
  {
    key: "ghg",
    endpoint: "ghg-emission",
    icon: Cloud,
    title: "GHG Emission",
    caption: "Greenhouse gas emission estimates",
    description:
      "Estimate emissions associated with each plot to support your compliance and reporting workflows.",
    tile: "bg-lime-100 text-lime-600",
  },
  {
    key: "rainfall",
    endpoint: "rainfall",
    icon: CloudRain,
    title: "Rainfall Analysis",
    caption: "Precipitation intelligence per polygon",
    description:
      "Get pixel-level annual rainfall data — mean, min, max, and variability — for every plot you upload.",
    tile: "bg-sky-100 text-sky-600",
  },
];

export const ALL_ANALYSIS_KEYS: AnalysisKey[] = eudrAnalyses.map((a) => a.key);

export const analysisByKey = (key: AnalysisKey): AnalysisType =>
  eudrAnalyses.find((a) => a.key === key) ?? eudrAnalyses[0];

/* -------------------------------------------------------------------------- */
/*  Coming-soon analysis types                                                */
/* -------------------------------------------------------------------------- */

export type ComingSoonType = {
  icon: LucideIcon;
  title: string;
};

export const comingSoonTypes: ComingSoonType[] = [
  { icon: Leaf, title: "Biomass" },
  { icon: Flame, title: "Fire Detection" },
  { icon: Sprout, title: "Crop Health" },
  { icon: Factory, title: "Mill Nearby" },
];

/* -------------------------------------------------------------------------- */
/*  "See exactly what you'll get" — value cards                               */
/* -------------------------------------------------------------------------- */

export type ValueCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  premium?: boolean;
};

export const valueCards: ValueCard[] = [
  {
    icon: LayoutDashboard,
    title: "Structured Dashboard",
    description:
      "All your plot results in one place — organized, scannable, and always accessible.",
  },
  {
    icon: FileText,
    title: "One-Click PDF Export",
    description:
      "Download audit-ready reports to share with your team, clients, or regulators.",
  },
  {
    icon: Sprout,
    title: "AI Insights",
    description:
      "Get actionable recommendations and risk flags generated from your actual plot data.",
    premium: true,
  },
];

/* Dashboard mockup sidebar navigation. */
export type DashboardNavItem = { icon: LucideIcon; label: string; active?: boolean };

export const dashboardNav: DashboardNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Map, label: "My Plots" },
  { icon: BarChart3, label: "Analyses" },
  { icon: FileText, label: "Reports" },
];

export const dashboardAccountNav: DashboardNavItem[] = [
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help" },
];

/* Dashboard mockup result tiles. */
export type DashboardResultTile = {
  label: string;
  value: string;
  caption: string;
  badge: string;
  /* Tailwind classes for the badge pill (background + text color). */
  badgeTint: string;
};

export const dashboardResultTiles: DashboardResultTile[] = [
  {
    label: "Rainfall Analysis",
    value: "2,450 mm",
    caption: "Annual mean across all plots",
    badge: "Data Ready",
    badgeTint: "bg-sky-100 text-sky-700",
  },
  {
    label: "Deforestation",
    value: "0 ha",
    caption: "No loss detected post-2020",
    badge: "Clear",
    badgeTint: "bg-emerald-100 text-emerald-700",
  },
];

export const dashboardInsights: string[] = [
  "Polygon 1 has the highest rainfall variance (±312 mm) — monitor for seasonal drought stress.",
  "No protected-area overlap detected — plots are compliant with EUDR conservation requirements.",
  "Recommend running GHG Emission analysis to complete your compliance package.",
];

/* -------------------------------------------------------------------------- */
/*  Pricing                                                                   */
/* -------------------------------------------------------------------------- */

export type CurrencyKey = "idr" | "usd";
export const CURRENCIES: Record<CurrencyKey, { symbol: string; label: string }> = {
  idr: { symbol: "Rp", label: "IDR (Rp)" },
  usd: { symbol: "$", label: "USD ($)" },
};

type Price = { amount: string; unit: string };

export type PricingTier = {
  name: string;
  tagline: string;
  /* Price per currency (currency symbol comes from CURRENCIES). */
  idr: Price;
  usd: Price;
  sub: string;
  /* Extra descriptive lines (used by the pay-as-you-go plan). */
  lines?: string[];
  /* Amber "extra usage" callout box; highlight text differs per currency. */
  callout?: { idr: string; usd: string; sub: string };
  features: string[];
  /* Optional trailing feature line that embeds the currency (appended last). */
  overage?: { idr: string; usd: string };
  featured?: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Pay As You Go",
    tagline: "For occasional users with no commitment",
    idr: { amount: "268.200", unit: "/hectare" },
    usd: { amount: "14.9", unit: "/hectare" },
    sub: "No monthly fee. No quota.",
    lines: ["Pay only when you run an analysis", "Billed per hectare analyzed"],
    features: [
      "EUDR compliance analysis",
      "Dashboard results",
      "GeoJSON upload & map draw",
      "PDF Export",
    ],
  },
  {
    name: "Regular",
    tagline: "For occasional users with no commitment",
    idr: { amount: "882.200", unit: "/bulan" },
    usd: { amount: "49", unit: "/month" },
    sub: "Includes 100 ha quota per month",
    callout: {
      idr: "Extra Usage: Rp9.000/ha if you run out of quota per month",
      usd: "Extra Usage: $0.50/ha if you run out of quota per month",
      sub: "Unused quota does not roll over",
    },
    features: [
      "EUDR compliance analysis",
      "Dashboard results",
      "GeoJSON upload & map draw",
      "PDF Export",
      "AI Insight",
    ],
  },
  {
    name: "Professional",
    tagline: "For organizations needing deep supply chain intelligence",
    idr: { amount: "2.321.300", unit: "/bulan" },
    usd: { amount: "129", unit: "/month" },
    sub: "Includes 500 ha quota per month",
    callout: {
      idr: "Extra Usage: Rp4.500/ha if you run out of quota per month",
      usd: "Extra Usage: $0.25/ha if you run out of quota per month",
      sub: "Unused quota does not roll over",
    },
    features: [
      "Everything in Regular",
      "Buy & export raw data",
      "Supply chain sustainability insight",
      "Insight per business & per country",
    ],
    overage: {
      idr: "Lower overage rate (Rp4.500/ha)",
      usd: "Lower overage rate ($0.25/ha)",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

export const legalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Data Security", href: "/privacy#security" },
];

/** Company / contact details shown in the footer. */
export const company = {
  legalName: "PT Niaga Bumi Lestari.",
  tagline: "Your land data, made actionable.",
  address: [
    "Prosperity Tower, 8th Floor Kawasan District 8, SCBD",
    "LOT 13 Jl. Jend. sudirman kav 52-53, RT.5/RW.3 Senayan,",
    "Kec. Kebayoran Baru Kota Jakarta Selatan, 12190",
  ],
  email: "contact@averos.land",
  socials: {
    instagram: "https://www.instagram.com/averos.land",
    linkedin:
      "https://www.linkedin.com/company/averos-spatial-data-verification-system/",
  },
};

/* -------------------------------------------------------------------------- */
/*  Policies, Terms & Conditions — shown on /privacy and in the T&C modal     */
/* -------------------------------------------------------------------------- */

export type PolicySection = { id?: string; heading: string; body: string };

export const policyIntro =
  "Welcome to Averos. By accessing or using our website, platform, services, or any related materials, you agree to comply with the following policies, terms, and conditions. Please read them carefully before using our services.";

export const policyUpdated = "Jakarta, June 19th 2026";

export const policySections: PolicySection[] = [
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
