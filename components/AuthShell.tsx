import Image from "next/image";
import Link from "next/link";

/** Centered card on the login page's background, for the password-reset pages. */
export default function AuthShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <header className="flex items-center gap-3 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center" aria-label="Averos home">
          <Image src="/AVEROS-logo.png" alt="Averos" width={2254} height={771} priority className="h-7 w-auto" />
        </Link>
        <span className="h-5 w-px bg-slate-300" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </header>
      <div className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-100">{children}</div>
      </div>
    </main>
  );
}

export const inputCls =
  "w-full rounded-md border border-slate-300 px-3.5 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-navy focus:ring-1 focus:ring-navy";
export const buttonCls =
  "w-full rounded-md bg-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-mid disabled:opacity-60";
