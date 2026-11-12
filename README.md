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

## DDS Submission (EUIS)

`/dashboard/dds` files Due Diligence Statements with the EU Information System
(EUIS / TRACES) through its V4 SOAP web services, **Acceptance environment only**
(there is no production endpoint in the code). Built from the public "EUDR
Information System – Operator API Reference" and the V4 WSDL/XSDs.

- Only valid plots that passed screening (no tree-cover loss after 2020, no
  protected-area overlap) go into a draft. Plots live in the browser session, so
  the draft keeps its own copy; area and plot key are recomputed on the server.
- The EUIS connection (web-service username, authentication key, WebServiceClientId,
  optional Web Service Access Identifier) is entered on the same page. The key is
  sealed with AES-256-GCM (`EUIS_CREDENTIAL_ENC_KEY`) and never shown again.
- Requests use WS-Security UsernameToken (PasswordDigest) with a timestamp.
- Submit once: the statement is marked SUBMITTING with an internal reference before
  the request leaves; an unclear outcome becomes "Check needed" and is resolved by
  looking that reference up in EUIS, never by sending it again.
- Status: first check one hour after submitting, then at most every 15 minutes
  (EUIS guidance). Withdraw while EUIS allows it.
- Opened account by account: `DDS_SUBMISSION_EMAILS` (emails, `@domain` entries or `*`).
  Other accounts see the menu item as "Soon", and every DDS/EUIS API answers 403.
- Free plan: up to 10 ha of distinct plots across filed statements; paid plans have no limit.
- Stored in `.data/dds/` and mirrored to PostgreSQL (`dds_accounts`, `dds_statements`).
- `EUIS_MOCK=1` + `EUIS_BASE_URL=<origin>/api/euis-mock` (never in production) runs a
  local mock EUIS; the e2e suite uses it.

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
