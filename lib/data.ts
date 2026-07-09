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
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
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

export type PricingTier = {
  name: string;
  tagline: string;
  currency: string;
  amount: string;
  unit: string;
  sub: string;
  /* Extra descriptive lines (used by the pay-as-you-go plan). */
  lines?: string[];
  /* Amber "extra usage" callout box. */
  callout?: { highlight: string; sub: string };
  features: string[];
  featured?: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Pay As You Go",
    tagline: "For occasional users with no commitment",
    currency: "Rp",
    amount: "268.200",
    unit: "/hectare",
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
    currency: "Rp",
    amount: "882.200",
    unit: "/bulan",
    sub: "Includes 100 ha quota per month",
    callout: {
      highlight: "Extra Usage: Rp9.000/ha if you run out of quota per month",
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
    currency: "Rp",
    amount: "2.321.300",
    unit: "/bulan",
    sub: "Includes 500 ha quota per month",
    callout: {
      highlight: "Extra Usage: Rp4.500/ha if you run out of quota per month",
      sub: "Unused quota does not roll over",
    },
    features: [
      "Everything in Regular",
      "Buy & export raw data",
      "Supply chain sustainability insight",
      "Insight per business & per country",
      "Lower overage rate (Rp4.500/ha)",
    ],
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
