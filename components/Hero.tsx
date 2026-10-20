import Image from "next/image";
import { heroChips } from "@/lib/data";

/* Polygon vertices as percentages of the 100×100 SVG viewBox. */
const POLYGON_POINTS = [
  [10, 44],
  [32, 18],
  [64, 22],
  [92, 48],
  [70, 80],
  [34, 74],
] as const;

const polygonPath = POLYGON_POINTS.map(([x, y]) => `${x},${y}`).join(" ");

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-deep text-white">
      {/* Cover background */}
      <Image
        src="/samples/bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className="absolute inset-0 -z-10 object-cover"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-28 lg:px-8">
        {/* Left: copy */}
        <div>
          <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
            Your Plot Data
            <br />
            Has Answers.
            <br />
            <span className="text-accent">Stop Guessing.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300 sm:text-lg">
            From deforestation alerts to land legality checks — get
            science-backed EUDR compliance without the spreadsheet chaos
          </p>
        </div>

        {/* Right: satellite visual + floating chips */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full">
            {/*
              PLACEHOLDER: satellite aerial photo of the forest plot.
              Swap this <div> for a real image, e.g.:
                <Image src="/hero-satellite.jpg" alt="Satellite view of the analyzed forest plot" fill className="rounded-2xl object-cover" />
            */}
            <div
              role="img"
              aria-label="Satellite aerial view of a forest plot with the analysis boundary highlighted"
              className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_25%,#1f3d2b,#0e2417_60%,#08160e)] ring-1 ring-white/10"
            />

            {/* Glowing analysis polygon */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="glow-cyan absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <polygon
                points={polygonPath}
                strokeWidth={0.9}
                strokeLinejoin="round"
                style={{
                  fill: "color-mix(in srgb, var(--color-glow-cyan) 10%, transparent)",
                  stroke: "var(--color-glow-cyan)",
                }}
              />
            </svg>

            {/* Vertex dots (separate non-stretched layer so they stay circular) */}
            <div className="pointer-events-none absolute inset-0">
              {POLYGON_POINTS.map(([x, y], i) => (
                <span
                  key={i}
                  className="glow-cyan absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    backgroundColor: "var(--color-glow-cyan)",
                  }}
                />
              ))}
            </div>

            {/* Floating data chips */}
            {heroChips.map((chip) => (
              <div
                key={chip.label}
                className={`absolute ${chip.position} flex items-center gap-2 rounded-xl border border-white/15 bg-navy-deep/80 px-3 py-2 shadow-lg backdrop-blur`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${chip.tint}`}
                >
                  <chip.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[10px] font-medium text-slate-300">
                    {chip.label}
                  </span>
                  <span className="block text-sm font-semibold text-white">
                    {chip.value}
                  </span>
                </span>
              </div>
            ))}

            {/* Bottom wide stat card */}
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 divide-x divide-white/15 rounded-xl border border-white/15 bg-navy-deep/80 shadow-lg backdrop-blur">
              <div className="px-5 py-3">
                <span className="block text-[10px] font-medium text-slate-300">
                  Plot Area
                </span>
                <span className="block text-sm font-semibold text-white">
                  128.45 ha
                </span>
              </div>
              <div className="px-5 py-3">
                <span className="block text-[10px] font-medium text-slate-300">
                  Perimeter
                </span>
                <span className="block text-sm font-semibold text-white">
                  4.32 km
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
