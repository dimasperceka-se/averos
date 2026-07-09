"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/data";
import { usePlotStore } from "@/lib/plotStore";

export default function Navbar({
  authed = false,
  userName,
}: {
  authed?: boolean;
  userName?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { clear } = usePlotStore();

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) return; // keep UI as-is if the server didn't clear the session
    } catch {
      return; // network error — don't optimistically show logged-out
    }
    clear();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
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
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-navy"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/agriplot"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-navy"
            >
              AgriPlot Map
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          {authed ? (
            <>
              {userName && (
                <span className="hidden text-sm text-slate-500 sm:inline">
                  Hi, {userName}
                </span>
              )}
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-mid md:flex"
              >
                Go to dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                className="hidden rounded-lg p-2 text-navy hover:bg-slate-100 md:inline-flex"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-mid"
            >
              Login
            </a>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <ul className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/agriplot"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                AgriPlot Map
              </Link>
            </li>
            {authed && (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Go to dashboard
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Log out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
