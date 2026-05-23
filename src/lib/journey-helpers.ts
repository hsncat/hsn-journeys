// ============================================================
// Journey utility functions — ported from legacy/data.js
// ============================================================

import type { Journey, Location, SubCard, Cost } from './types';

/**
 * Split a (journey) into multiple location objects.
 * Uses "·" (middle dot) to split country (international),
 * "&" to split province or city (domestic).
 */
export function generateLocations(journey: Journey): Location[] {
  const results: Location[] = [];
  const countries = journey.country.split('·').map((s: string) => s.trim()).filter(Boolean);
  const provinces = journey.province.split('&').map((s: string) => s.trim()).filter(Boolean);
  const cities = journey.city.split('&').map((s: string) => s.trim()).filter(Boolean);

  if (countries.length > 1) {
    for (const c of countries) {
      results.push({
        name: c,
        type: 'country',
        country: c,
        province: journey.province,
        emoji: journey.emoji,
        count: 1,
        journeys: [journey],
      });
    }
  } else if (provinces.length > 1) {
    for (const p of provinces) {
      results.push({
        name: p,
        type: 'province',
        country: journey.country,
        province: p,
        emoji: journey.emoji,
        count: 1,
        journeys: [journey],
      });
    }
  } else if (cities.length > 1) {
    for (const c of cities) {
      results.push({
        name: c,
        type: 'city',
        country: journey.country,
        province: journey.province,
        emoji: journey.emoji,
        count: 1,
        journeys: [journey],
      });
    }
  } else {
    results.push({
      name: journey.city,
      type: 'city',
      country: journey.country,
      province: journey.province,
      emoji: journey.emoji,
      count: 1,
      journeys: [journey],
    });
  }
  return results;
}

/**
 * Aggregate all locations across all journeys, sorted by visit count desc.
 */
export function getLocationList(journeys: Journey[]): Location[] {
  const map = new Map<string, Location>();

  for (const j of journeys) {
    const locs = generateLocations(j);
    for (const loc of locs) {
      const key = `${loc.name}|${loc.type}`;
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.count += 1;
        existing.journeys.push(j);
      } else {
        loc.count = 1;
        map.set(key, loc);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/**
 * Summarize costs from a cost object as a display string.
 */
export function sumCosts(cost: Cost): number {
  return (
    (cost.packageFee || 0) +
    (cost.transportFee || 0) +
    (cost.accommodationFee || 0) +
    (cost.foodFee || 0) +
    (cost.shoppingFee || 0) +
    (cost.ticketFee || 0)
  );
}

/**
 * Aggregate subcard data back into the primary journey fields.
 * Port of syncPrimaryFromSubCards from legacy code.
 */
export function syncPrimaryFromSubCards(journey: Journey): Journey {
  const subs = journey.subCards;
  if (!subs || subs.length === 0) return journey;

  // Aggregate cities and provinces
  journey.city = subs.map((s: SubCard) => s.city).filter(Boolean).join(' & ');
  journey.province = subs.map((s: SubCard) => s.province).filter(Boolean).join(' & ');
  journey.title = subs.map((s: SubCard) => s.name).filter(Boolean).join(' · ');
  journey.emoji = subs[0]?.emoji || journey.emoji;

  // Earliest / latest dates
  const dates = subs.map((s: SubCard) => s.date).filter(Boolean).sort();
  const endDates = subs.map((s: SubCard) => s.endDate).filter(Boolean).sort();
  if (dates.length) journey.date = dates[0];
  if (endDates.length) journey.endDate = endDates[endDates.length - 1];

  // Sum costs
  journey.costs = {
    packageFee: subs.reduce((s: number, c: SubCard) => s + (c.costs?.packageFee || 0), 0),
    transportFee: subs.reduce((s: number, c: SubCard) => s + (c.costs?.transportFee || 0), 0),
    accommodationFee: subs.reduce((s: number, c: SubCard) => s + (c.costs?.accommodationFee || 0), 0),
    foodFee: subs.reduce((s: number, c: SubCard) => s + (c.costs?.foodFee || 0), 0),
    shoppingFee: subs.reduce((s: number, c: SubCard) => s + (c.costs?.shoppingFee || 0), 0),
    ticketFee: subs.reduce((s: number, c: SubCard) => s + (c.costs?.ticketFee || 0), 0),
  };

  // Aggregate highlights from subcard itinerary tables ("上午/下午" columns)
  const hlSet = new Set<string>();
  for (const sub of subs) {
    if (sub.itineraryTable) {
      const { headers, rows } = sub.itineraryTable;
      const amIdx = headers.findIndex((h: string) => h === '上午');
      const pmIdx = headers.findIndex((h: string) => h === '下午');
      for (const row of rows) {
        if (amIdx >= 0 && row[amIdx]) hlSet.add(row[amIdx]);
        if (pmIdx >= 0 && row[pmIdx]) hlSet.add(row[pmIdx]);
      }
    }
  }
  journey.highlights = Array.from(hlSet).slice(0, 8).map((text, i) => ({
    id: 0,
    journeyId: journey.id,
    text,
    sortOrder: i,
  }));

  // Use first subcard photo
  for (const sub of subs) {
    if (sub.photoKey) {
      journey.photoKey = sub.photoKey;
      journey.photoUrl = sub.photoUrl;
      break;
    }
  }

  return journey;
}

/**
 * Get number of travel days for a journey.
 */
export function getDays(journey: Journey): number {
  const start = new Date(journey.date);
  const end = journey.endDate ? new Date(journey.endDate) : new Date(journey.date);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Format a number with 2 decimal places, or return "—" for 0.
 */
export function fmtNumber(n: number): string {
  if (!n || n === 0) return '—';
  return n.toFixed(2);
}
