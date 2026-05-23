# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HSN Journey Traces is a full-stack travel journal app deployed on Cloudflare Pages. Display pages use Astro SSG (zero JS for visitors). The admin dashboard is a React SPA at `/admin/*`. All data lives in Cloudflare D1 (SQLite), photos in R2 (object storage).

## Architecture

```
Cloudflare Pages (unified deployment)
├── /                    ← Astro SSG static pages (index, cities, map, wishlist)
├── /cities/[id]         ← Astro SSR (calls D1 at request time)
├── /admin/*             ← React SPA (client-only, prerender=false)
├── /api/*               ← Pages Functions with Hono (functions/api/)
├── D1                   ← SQLite database (hsn-journeys-db)
└── R2                   ← Photo storage (hsn-journeys-photos)
```

## Local Development

```bash
npm run dev          # astro dev (runs on localhost:4321)
npm run build        # astro build (outputs to dist/)
npm run preview      # wrangler pages dev ./dist (local Cloudflare simulation)
npm run db:migrate   # Apply D1 migrations to remote DB
npm run db:seed      # Seed remote D1 from legacy data
```

The project requires Cloudflare credentials. Ensure `wrangler.toml` is configured.

## Project File Structure

```
├── astro.config.mjs          # Astro 5 config (static output, cloudflare adapter)
├── wrangler.toml             # D1 + R2 bindings, env vars
├── functions/                # Pages Functions (API backend)
│   ├── _middleware.ts        # JWT auth middleware
│   └── api/                  # Route handlers (auth, journeys, wishlist, packing, photos, coordinates, stats, trigger-deploy)
├── src/
│   ├── pages/                # Astro routes (SSG + SSR)
│   │   ├── index.astro       # Homepage (SSG)
│   │   ├── cities.astro      # Cities list (SSG)
│   │   ├── cities/[id].astro # Journey detail (SSR — prerender=false)
│   │   ├── map.astro         # Leaflet map (SSG)
│   │   ├── wishlist.astro    # Wishlist grid (SSG)
│   │   └── admin/[...slug].astro  # Admin SPA entry (SSR — prerender=false)
│   ├── layouts/              # Astro layouts (BaseLayout, PageLayout, AdminLayout)
│   ├── components/           # Astro components (13 files: Navbar, Footer, TabBar, Icons, JourneyCard, StatCard, HighlightChips, EmptyState, SkeletonCard, CostRow, ItineraryTable, PhotoLightbox, PackingList)
│   ├── admin/                # React SPA (only served at /admin/*)
│   │   ├── App.tsx           # Root: QueryClient + BrowserRouter + AuthProvider
│   │   ├── main.tsx          # Mount function
│   │   ├── router.tsx        # Admin routes with AuthGuard
│   │   ├── api.ts            # Fetch wrapper with JWT auth
│   │   ├── types.ts          # Admin-specific types
│   │   ├── hooks/            # useAuth, useJourneys, useWishlist, usePacking, usePhotoUpload
│   │   ├── components/       # Sidebar, AuthGuard, PhotoUploader, HighlightInput, ItineraryGridEditor, SortableList, ConfirmDialog, DeployButton
│   │   └── pages/            # Login, Register, Dashboard, JourneyList, JourneyEdit, Wishlist, PackingList, Coordinates, Settings
│   ├── lib/
│   │   ├── d1-client.ts      # D1 query functions (build-time data fetching)
│   │   ├── journey-helpers.ts # Pure functions: getLocationList, sumCosts, getDays, etc.
│   │   ├── types.ts          # Shared TypeScript types
│   │   ├── constants.ts      # Cost labels, R2 URL, site name
│   │   └── ssg-data.ts       # Legacy data loader (reads data/journeys.json)
│   └── styles/
│       ├── tokens.css         # Design system CSS custom properties + dark mode
│       └── global.css         # Reset, typography, utilities
├── migrations/               # D1 SQL migration files
├── scripts/                  # seed-from-json.ts, migrate-photos-to-r2.ts
├── legacy/                   # Original static HTML/CSS/JS project (archived)
└── public/                   # Static assets (favicon, robots.txt)
```

## Data Flow

- **Display pages** (Astro SSG): Build time → D1 query via platform proxy → generate static HTML → CDN serves
- **Detail page** (Astro SSR): Request → D1 query → render HTML → CDN caches
- **Admin SPA**: Client fetches `/api/*` → Pages Functions → D1/R2 read/write → save → optionally trigger Pages redeploy
- **API auth**: JWT (HS256, 7-day expiry) stored in localStorage. Middleware validates on write endpoints

## Database (D1)

15 tables: users, journeys, highlights, costs, itinerary_items, sub_cards (TEXT id), sub_card_highlights, sub_card_costs, sub_card_itinerary, wishlist_items, wishlist_highlights, packing_categories, packing_items, city_coordinates, settings.

Remote DB ID: `56c2b4ec-59cc-4ded-8bd1-b21c4d6d4d60`

## Design System

- **Heading font:** Caveat (Google Fonts)
- **Body font:** Quicksand (Google Fonts)
- **Primary color:** `#18181B`, Accent: `#2563EB`, Background: `#FAFAFA`
- **Dark mode:** `[data-theme="dark"]` on `<html>`, toggled via localStorage
- **CSS tokens** in `src/styles/tokens.css` — colors, spacing, fonts, shadows, radii, z-indices, animations
