# Averos — Marketing Landing Page

A responsive marketing landing page for **Averos**, a land/plot geospatial
analysis SaaS (rainfall, deforestation, GHG, EUDR compliance).

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first config via `@theme` in `app/globals.css`)
- **lucide-react** for all icons
- Fonts via `next/font/google`: **Plus Jakarta Sans** (display) + **Inter** (body)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Structure

```
app/
  layout.tsx        # fonts + metadata
  page.tsx          # composes the sections
  globals.css       # Tailwind import + design tokens (@theme) + custom utilities
components/
  Navbar.tsx        # sticky nav + mobile menu (client component)
  Hero.tsx          # navy hero, CSS satellite placeholder, glowing polygon, chips
  AnalysisTypes.tsx # "What do you want to know about your land?" (5 cards)
  ComingSoon.tsx    # coming-soon band (4 muted cards)
  WhatYouGet.tsx    # "See exactly what you'll get." (+ DashboardMockup)
  DashboardMockup.tsx # pure HTML/CSS product mockup (no screenshot)
  Pricing.tsx       # 3 pricing tiers
  Footer.tsx
lib/
  data.ts           # all repeated content as typed arrays (nav, cards, tiers…)
```

All repeated content (nav links, feature cards, pricing tiers, footer links) is
defined once in [`lib/data.ts`](lib/data.ts) and rendered via `.map()`.

## Design tokens

Defined in [`app/globals.css`](app/globals.css):

| Token            | Value     | Usage                                    |
| ---------------- | --------- | ---------------------------------------- |
| `--color-navy-deep` | `#0B1B3B` | gradient edge, footer, dashboard sidebar |
| `--color-navy-mid`  | `#11295C` | gradient center, button hover            |
| `--color-navy`      | `#1B3A6B` | headings on light sections, buttons      |
| `--color-accent`    | `#34D685` | "Stop Guessing.", wordmark, checkmarks   |

Use as utilities: `bg-navy`, `text-accent`, `bg-navy-gradient`, etc.

## Where to drop real images

See [`public/README.md`](public/README.md). In short: only the hero satellite
photo needs a real asset — swap the placeholder `<div>` in
[`components/Hero.tsx`](components/Hero.tsx) for a `next/image`.
