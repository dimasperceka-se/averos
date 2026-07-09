"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agriplot", label: "AgriPlot", icon: Map },
];

/** Tab bar for the authenticated area: existing dashboard + AgriPlot map. */
export default function AppTabs() {
  const pathname = usePathname();
  return (
    <div className="border-b border-slate-200 bg-white">
      <nav
        className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6 lg:px-8"
        aria-label="Sections"
      >
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "border-navy text-navy"
                  : "border-transparent text-slate-500 hover:text-navy"
              }`}
            >
              <t.icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
