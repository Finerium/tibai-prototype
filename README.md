# Tiba

Tiba (logotype: TibAI) is a decision-support platform for Jakarta's transit agency, DISHUB DKI Jakarta. It forecasts arrival-time reliability as probability bands (P10, P50, P90) rather than single point ETAs, synchronizes intermodal transfers across TransJakarta, MRT, LRT, and KRL (with Dukuh Atas as the exemplar interchange), and ranks operational interventions by impact.

This repository is a single Next.js application that brings together two surfaces under one brand:

- A marketing and pitch **landing page** at the root route.
- The **reliability console** (an operator dashboard plus a rider-facing reliability view) under `/app`, reached through a demo login gate.

## Prototype scope

This is a prototype built for a competition and for screenshots. It has no real backend, no database, and no real authentication. All figures are mock data that use real Jakarta corridor and station names with plausible invented numbers. The login screen is a demo gate that routes the visitor into the app: it performs no real authentication and calls no backend. The network map is a stylized SVG corridor diagram, not a live tile map.

## Routes

| Route | Surface |
| --- | --- |
| `/` | Landing page (light-dominant, bilingual EN/ID) |
| `/login` | Demo login gate, routes through to the app |
| `/app` | Operator console: KPI strip, stylized network map, ranked interventions, before-and-after simulator |
| `/app/corridors/[id]` | Corridor detail: P10/P50/P90 reliability band and causal decomposition |
| `/app/interchanges/[id]` | Interchange detail (Dukuh Atas exemplar): stacked schedule and transfer synchronization |
| `/app/rider` | Rider reliability view, calmer plain-language register |
| `/app/reports` | Reliability reports, with loading, empty, and error states |
| `/app/settings` | Console preferences: theme, density, motion, risk threshold |

The console defaults to a dark control-room theme with a working light theme toggle. A command palette is available throughout the console via Cmd-K (Ctrl-K on Windows and Linux).

### Demo login

Any email and any password of at least 6 characters signs in. The password `gagal` triggers the error state for demonstration. The SSO button signs in directly.

## Design system

The two surfaces share one brand: a terracotta signature accent and warm neutrals, never pure black and never pure white. The landing keeps its light-dominant treatment; the console provides first-class dark and light themes. Tokens are reconciled in a single Tailwind config and a single entry stylesheet, scoped per surface so the two systems never collide.

Typography follows each surface as designed: the landing uses Geist and Geist Mono with Clash Display for its display headings; the console uses IBM Plex Sans and IBM Plex Mono. All faces are self-hosted through `next/font` so there are no render-blocking external requests.

## Motion

The landing uses GSAP with ScrollTrigger for its scroll choreography and diagram draw-ins, Lenis for smooth scrolling synced to the GSAP ticker, and the Motion library for component reveals and count-ups. Every motion path has a `prefers-reduced-motion` fallback: Lenis is skipped, diagrams render their final state immediately, and reveals settle without tweening.

## Tech stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- `next/font` for self-hosted fonts
- GSAP with ScrollTrigger and SplitText, Lenis, and Motion for landing motion
- A hand-built command palette for the console

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

To produce and serve a production build:

```bash
npm run build
npm run start
```

To lint:

```bash
npm run lint
```

## Accessibility

The interface targets WCAG 2.1 AA: a single landmark structure with one `h1` on the landing, visible focus, full keyboard navigation, status conveyed by shape and label rather than color alone, and a complete static experience when reduced motion is requested.

## Data and references

Figures are illustrative. Load-bearing context: Greater Jakarta congestion losses are referenced at the order of Rp 100 trillion per year (BAPPENAS / JUTPI II, 2019); public-transit mode share fell from 57.7 percent (2002) to 8.8 percent (2018) (JUTPI II, 2019); riders value waiting time well above in-vehicle time (Kreindler et al., NBER, 2023); and Jakarta targets 60 percent public-transit mode share by 2030. No public GTFS-RT feed exists for Jakarta yet, so the model is designed to deliver reliability from static and historical data and to absorb real-time feeds when they become available.
