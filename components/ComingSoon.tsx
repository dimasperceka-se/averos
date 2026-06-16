import { comingSoonTypes } from "@/lib/data";

export default function ComingSoon() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        {/* Divider with centered heading */}
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Coming Soon
          </h2>
          <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoonTypes.map((type) => (
            <li
              key={type.title}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-8 text-center"
            >
              <type.icon className="h-7 w-7 text-slate-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-500">
                {type.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
