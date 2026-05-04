# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HSN Journey Traces is a static, multi-page travel journal website. It is built with plain HTML, CSS, and vanilla JavaScript. There is no build system, no package manager, and no test suite.

## Local Development

Serve the repository root with any static file server. For example:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080` in a browser.

## Page Structure

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Stats summary, recent journeys grid, packing list table |
| Cities | `cities.html` | Expandable primary/secondary card list of all journeys |
| Map | `map.html` | Leaflet.js map with markers for visited locations |
| Wishlist | `wishlist.html` | Grid of planned future trips |
| Detail | `detail.html?id=<id>` | Single journey view with story, itinerary, costs, photos |
| Add | `add.html` | Form to add a new journey |

All pages share `styles.css` and include `data.js` before their page-specific script.

## Data Architecture

`data.js` is the central data layer.

- **`defaultJourneys`** — Hard-coded source of truth for the initial journey dataset.
- **`wishlist`** — Hard-coded array of planned trips.
- **`journeys`** — Runtime mutable array. Initialized from `localStorage` key `hsn-journeys`, or falls back to a deep copy of `defaultJourneys`.
- **Force reset** — On first load (or after a version bump), `resetJourneys()` is triggered by the flag `hsn-journeys-reset-v20260504` in `localStorage`. This overwrites any persisted data with `defaultJourneys`.

Key utility functions in `data.js`:
- `getCityList()` — Deduplicates journeys by `city`, counts occurrences.
- `getJourneyById(id)` — Lookup by numeric `id`.
- `generateLocations(journey)` — Splits multi-location journeys into individual location objects. Uses `·` to split `country` (international), `&` to split `province` or `city` (domestic).
- `getLocationList()` — Returns all locations across all journeys, sorted by visit count.
- `addJourney()`, `updateJourney()`, `deleteJourney()`, `saveJourneys()` — Mutate `journeys` and persist to `localStorage`.

## Journey Data Model

```js
{
  id: number,
  province: string,        // e.g. "福建" or "欧洲"
  city: string,            // e.g. "厦门" or "法瑞意"
  country: string,         // e.g. "中国" or "法国·瑞士·意大利"
  date: string,            // "YYYY-MM-DD"
  endDate: string,         // "YYYY-MM-DD"
  title: string,
  emoji: string,
  description: string,
  highlights: string[],    // e.g. ["鼓浪屿", "厦门大学"]
  story: string,           // Long-form narrative
  cost: {
    package: number,       // 报团费
    transport: number,     // 交通费
    accommodation: number, // 住宿费
    food: number           // 餐饮费
  },
  itinerary: [
    { date, morning, afternoon, evening, note }
  ],
  photo: string,           // Base64 data URL or image path
  subCards: [              // Optional sub-location entries
    { name, date, endDate, province, city, emoji, highlights, cost }
  ]
}
```

## Key JavaScript Files

- **`cities.js`** — Renders expandable primary cards. Each primary card can expand to show secondary cards (auto-generated from `generateLocations`, or from `subCards` if defined). Supports inline editing of the primary card and adding/editing/deleting sub-cards. `syncPrimaryFromSubCards()` aggregates sub-card dates, costs, and highlights back to the parent journey.
- **`detail.js`** — Renders a full journey page. Includes an inline edit form with an itinerary table editor (`renderItineraryEditor`) and photo upload via `FileReader` to Base64.
- **`map.js`** — Contains `cityCoordinates`, a hard-coded array of `{ name, lat, lng, type }`. `getMapLocations()` maps journeys to these coordinates via `generateLocations`. International markers use red (`#e53e3e`), domestic use blue (`#2563EB`).
- **`script.js`** — Homepage: computes stats and renders the 3 most recent journeys.
- **`wishlist.js`** — Renders the static `wishlist` array from `data.js`.

## Design System

Reference `design-system/hsn-journey-traces/MASTER.md` for the full spec.

- **Heading font:** Caveat (Google Fonts)
- **Body font:** Quicksand (Google Fonts)
- **Primary color:** `#18181B`
- **Accent/CTA:** `#2563EB`
- **Background:** `#FAFAFA`

Note: The design system forbids emojis as icons in favor of SVGs, but the current codebase uses emojis extensively for journey visuals. When adding new UI elements, prefer SVG icons; when editing journey data, emojis are the established convention.

## Important Implementation Details

- **Multi-location splitting** — `generateLocations()` is the single source of truth for how a journey is broken into map pins and secondary cards. Adding a new multi-stop trip requires using `&` (for province/city) or `·` (for country) in the appropriate field.
- **Map coordinates** — Any new location displayed on the map must also be added to the `cityCoordinates` array in `map.js` with `lat`/`lng`.
- **Photo storage** — Photos are stored as Base64 data URLs in `localStorage`. There is no backend or external image hosting.
- **No framework** — All DOM manipulation is vanilla JS. There are no reactive data bindings; after mutating `journeys`, call `saveJourneys()` and manually update the DOM or reload the page.
