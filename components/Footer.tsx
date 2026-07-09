import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import { company, legalLinks } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-navy-gradient text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          {/* Brand + company */}
          <div className="max-w-md">
            <Image
              src="/AVEROS-logo-light.png"
              alt="Averos"
              width={2254}
              height={771}
              className="h-9 w-auto"
            />
            <p className="mt-2 text-sm text-slate-400">{company.tagline}</p>

            <p className="mt-6 text-sm font-bold text-white">{company.legalName}</p>
            <address className="mt-1 space-y-0.5 text-sm not-italic text-slate-400">
              {company.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <a
              href={`mailto:${company.email}`}
              className="mt-4 inline-block text-sm font-bold text-white hover:text-accent"
            >
              {company.email}
            </a>

            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Legal */}
          <nav aria-label="Legal">
            <h2 className="text-sm font-semibold text-white">Legal</h2>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <hr className="my-10 border-white/10" />

        <p className="text-xs text-slate-500">
          © 2026 Averos. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
