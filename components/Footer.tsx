import Image from "next/image";
import { legalLinks } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-navy-gradient text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          {/* Brand */}
          <div>
            <Image
              src="/AVEROS-logo-light.png"
              alt="Averos"
              width={2254}
              height={771}
              className="h-9 w-auto"
            />
            <p className="mt-2 text-sm text-slate-400">
              Your land data, made actionable.
            </p>
          </div>

          {/* Legal */}
          <nav aria-label="Legal">
            <h2 className="text-sm font-semibold text-white">Legal</h2>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
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
