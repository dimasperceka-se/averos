"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Home, KeyRound, LogOut, Send } from "lucide-react";
import { usePlotStore } from "@/lib/plotStore";
import { useDdsAccess } from "@/lib/ddsClient";

/** `gated`: only for accounts that have DDS Submission; others see it as "Soon". */
const NAV = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/eudr", label: "EUDR results", icon: BarChart3 },
  { href: "/dashboard/dds", label: "DDS Submission", icon: Send, gated: true },
];

export default function EudrSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { userName, userEmail, clear, refreshUser } = usePlotStore();
  const ddsAccess = useDdsAccess();
  // The most specific item wins: /dashboard/dds/… marks DDS Submission, not Overview.
  const active = [...NAV].sort((a, b) => b.href.length - a.href.length).find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))?.href;

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const initials =
    userName
      .replace(/[[\]]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "UN";

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    clear();
    router.push("/");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy-gradient p-5 text-white md:flex">
      <Link href="/" className="px-1" aria-label="Averos home">
        <Image
          src="/AVEROS-logo-light.png"
          alt="Averos"
          width={2254}
          height={771}
          className="h-8 w-auto"
        />
      </Link>

      <nav className="mt-8 space-y-1" aria-label="Dashboard">
        {NAV.map(({ href, label, icon: Icon, gated }) =>
          gated && ddsAccess !== true ? (
            <span
              key={href}
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
              {ddsAccess === false && (
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-300 uppercase">Soon</span>
              )}
            </span>
          ) : (
            <Link
              key={href}
              href={href}
              aria-current={active === href ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 ${
                active === href ? "bg-white/10 text-white" : "text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ),
        )}
      </nav>

      <div className="mt-auto space-y-3">
        {/* User card */}
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-navy-deep">
            {initials}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">{userName}</span>
            <span className="block truncate text-[11px] text-slate-300">
              {userEmail}
            </span>
          </span>
        </div>

        <div className="space-y-1 border-t border-white/10 pt-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Change Password
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
