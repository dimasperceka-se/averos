"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { navLinks } from "@/lib/data";
import { usePlotStore } from "@/lib/plotStore";

export default function DashboardNavbar() {
  const router = useRouter();
  const { userName, clear, refreshUser } = usePlotStore();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" className="flex items-center" aria-label="Averos home">
          <Image
            src="/AVEROS-logo.png"
            alt="Averos"
            width={2254}
            height={771}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={`/${link.href}`}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">
            Hi, {userName}
          </span>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-mid"
          >
            Go to dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="rounded-lg p-2 text-navy hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  );
}
