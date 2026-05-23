// ============================================================
// D1 Client — used by Astro at build time for SSG data fetching
// Also used by Pages Functions at runtime via context.env.DB
// ============================================================

import type { Journey, WishlistItem, PackingCategory, CityCoordinate, PageStats, SubCard } from './types';

// Runtime D1 binding (used in Pages Functions)
export function getDB(env: { DB: D1Database }) {
  return env.DB;
}

// Build-time: read from local D1 via wrangler pages dev proxy, or fallback
// In Astro, we use the platform proxy provided by @astrojs/cloudflare

// ============================================================
// Journey queries
// ============================================================

export async function getJourneys(db: D1Database): Promise<Journey[]> {
  const result = await db.prepare(
    'SELECT * FROM journeys ORDER BY date DESC, sort_order ASC'
  ).all();

  // For SSG, we need to eager-load relations
  const journeys: Journey[] = [];
  for (const row of result.results) {
    const j = mapJourneyRow(row);
    // Eager load related data
    j.highlights = await getHighlights(db, j.id);
    j.costs = await getCost(db, j.id);
    j.itinerary = await getItinerary(db, j.id);
    j.subCards = await getSubCards(db, j.id);
    journeys.push(j);
  }
  return journeys;
}

export async function getJourneyById(db: D1Database, id: number): Promise<Journey | null> {
  const result = await db.prepare('SELECT * FROM journeys WHERE id = ?').bind(id).first();
  if (!result) return null;
  const j = mapJourneyRow(result);
  j.highlights = await getHighlights(db, j.id);
  j.costs = await getCost(db, j.id);
  j.itinerary = await getItinerary(db, j.id);
  j.subCards = await getSubCards(db, j.id);
  return j;
}

async function getHighlights(db: D1Database, journeyId: number) {
  const r = await db.prepare(
    'SELECT * FROM highlights WHERE journey_id = ? ORDER BY sort_order'
  ).bind(journeyId).all();
  return r.results.map(mapHighlightRow);
}

async function getCost(db: D1Database, journeyId: number) {
  const r = await db.prepare(
    'SELECT * FROM costs WHERE journey_id = ?'
  ).bind(journeyId).first();
  return mapCostRow(r);
}

async function getItinerary(db: D1Database, journeyId: number) {
  const r = await db.prepare(
    'SELECT * FROM itinerary_items WHERE journey_id = ? ORDER BY sort_order'
  ).bind(journeyId).all();
  return r.results.map(mapItineraryRow);
}

async function getSubCards(db: D1Database, journeyId: number) {
  const r = await db.prepare(
    'SELECT * FROM sub_cards WHERE journey_id = ? ORDER BY sort_order'
  ).bind(journeyId).all();

  const subs = [];
  for (const row of r.results) {
    const sub = mapSubCardRow(row);
    sub.highlights = await getSubCardHighlights(db, sub.id);
    sub.costs = await getSubCardCost(db, sub.id);
    sub.itineraryTable = await getSubCardItinerary(db, sub.id);
    subs.push(sub);
  }
  return subs;
}

async function getSubCardHighlights(db: D1Database, subCardId: string) {
  const r = await db.prepare(
    'SELECT * FROM sub_card_highlights WHERE sub_card_id = ? ORDER BY sort_order'
  ).bind(subCardId).all();
  return r.results.map((h: Record<string, unknown>) => ({
    id: h.id as number,
    subCardId: h.sub_card_id as string,
    text: h.text as string,
    sortOrder: h.sort_order as number,
  }));
}

async function getSubCardCost(db: D1Database, subCardId: string) {
  const r = await db.prepare(
    'SELECT * FROM sub_card_costs WHERE sub_card_id = ?'
  ).bind(subCardId).first();
  return mapCostRow(r);
}

async function getSubCardItinerary(db: D1Database, subCardId: string) {
  const rows = await db.prepare(
    'SELECT * FROM sub_card_itinerary WHERE sub_card_id = ? ORDER BY row_index, header_index'
  ).bind(subCardId).all();

  // Reconstruct {headers, rows} from normalized storage
  const headers: string[] = [];
  const rowMap = new Map<number, string[]>();

  for (const cell of rows.results) {
    const c = cell as Record<string, unknown>;
    const hIdx = c.header_index as number;
    const rIdx = c.row_index as number;
    const hText = c.header_text as string;
    const val = c.cell_value as string;

    // Build headers in order
    if (!headers.includes(hText)) {
      headers[hIdx] = hText;
    }

    // Build rows
    if (!rowMap.has(rIdx)) {
      rowMap.set(rIdx, []);
    }
    const row = rowMap.get(rIdx)!;
    row[hIdx] = val;
  }

  const rows2d = Array.from(rowMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, row]) => headers.map((_, i) => row[i] || ''));

  return { headers: headers.filter(Boolean), rows: rows2d };
}

// ============================================================
// Wishlist queries
// ============================================================

export async function getWishlist(db: D1Database): Promise<WishlistItem[]> {
  const r = await db.prepare(
    'SELECT * FROM wishlist_items ORDER BY sort_order'
  ).all();
  const items: WishlistItem[] = [];
  for (const row of r.results) {
    const item = mapWishlistRow(row);
    item.highlights = await getWishlistHighlights(db, item.id);
    items.push(item);
  }
  return items;
}

async function getWishlistHighlights(db: D1Database, wishlistId: number) {
  const r = await db.prepare(
    'SELECT * FROM wishlist_highlights WHERE wishlist_id = ? ORDER BY sort_order'
  ).bind(wishlistId).all();
  return r.results.map((h: Record<string, unknown>) => ({
    id: h.id as number,
    wishlistId: h.wishlist_id as number,
    text: h.text as string,
    sortOrder: h.sort_order as number,
  }));
}

// ============================================================
// Packing queries
// ============================================================

export async function getPacking(db: D1Database): Promise<PackingCategory[]> {
  const cats = await db.prepare(
    'SELECT * FROM packing_categories ORDER BY sort_order'
  ).all();
  const result: PackingCategory[] = [];
  for (const cat of cats.results) {
    const c = cat as Record<string, unknown>;
    const items = await db.prepare(
      'SELECT * FROM packing_items WHERE category_id = ? ORDER BY sort_order'
    ).bind(c.id as number).all();
    result.push({
      id: c.id as number,
      name: c.name as string,
      sortOrder: c.sort_order as number,
      items: items.results.map((i: Record<string, unknown>) => ({
        id: i.id as number,
        categoryId: i.category_id as number,
        item: i.item as string,
        note: i.note as string,
        checked: !!(i.checked as number),
        sortOrder: i.sort_order as number,
      })),
    });
  }
  return result;
}

// ============================================================
// Coordinates queries
// ============================================================

export async function getCoordinates(db: D1Database): Promise<CityCoordinate[]> {
  const r = await db.prepare('SELECT * FROM city_coordinates ORDER BY name').all();
  return r.results.map((row: Record<string, unknown>) => ({
    id: row.id as number,
    name: row.name as string,
    country: row.country as string,
    lat: row.lat as number,
    lng: row.lng as number,
    type: row.type as 'domestic' | 'international',
  }));
}

// ============================================================
// Stats
// ============================================================

export async function getStats(db: D1Database): Promise<PageStats> {
  const [journeyCount, cityCount, costSum] = await Promise.all([
    db.prepare('SELECT COUNT(*) as c FROM journeys').first(),
    db.prepare('SELECT COUNT(DISTINCT city) as c FROM journeys').first(),
    db.prepare(
      'SELECT SUM(package_fee + transport_fee + accommodation_fee + food_fee + shopping_fee + ticket_fee) as total FROM costs'
    ).first(),
  ]);

  return {
    journeyCount: (journeyCount as Record<string, number>)?.c || 0,
    cityCount: (cityCount as Record<string, number>)?.c || 0,
    photoCount: 0, // approximate
    totalCost: (costSum as Record<string, number>)?.total || 0,
    countryCount: 0,
  };
}

// ============================================================
// Row mappers (snake_case DB -> camelCase TypeScript)
// ============================================================

function mapJourneyRow(r: Record<string, unknown> | null): Journey {
  if (!r) return {} as Journey;
  return {
    id: r.id as number,
    province: r.province as string || '',
    city: r.city as string || '',
    country: r.country as string || '中国',
    date: r.date as string || '',
    endDate: r.end_date as string || '',
    title: r.title as string || '',
    emoji: r.emoji as string || '📍',
    description: r.description as string || '',
    story: r.story as string || '',
    photoKey: r.photo_key as string || null,
    photoUrl: undefined,
    sortOrder: r.sort_order as number || 0,
    highlights: [],
    costs: { packageFee: 0, transportFee: 0, accommodationFee: 0, foodFee: 0, shoppingFee: 0, ticketFee: 0 },
    itinerary: [],
    subCards: [],
    createdAt: r.created_at as string || '',
    updatedAt: r.updated_at as string || '',
  };
}

function mapHighlightRow(r: Record<string, unknown> | null) {
  if (!r) return { id: 0, journeyId: 0, text: '', sortOrder: 0 };
  return {
    id: r.id as number,
    journeyId: r.journey_id as number,
    text: r.text as string,
    sortOrder: r.sort_order as number,
  };
}

function mapCostRow(r: Record<string, unknown> | null) {
  return {
    packageFee: (r?.package_fee as number) || 0,
    transportFee: (r?.transport_fee as number) || 0,
    accommodationFee: (r?.accommodation_fee as number) || 0,
    foodFee: (r?.food_fee as number) || 0,
    shoppingFee: (r?.shopping_fee as number) || 0,
    ticketFee: (r?.ticket_fee as number) || 0,
  };
}

function mapItineraryRow(r: Record<string, unknown> | null) {
  if (!r) return { id: 0, journeyId: 0, date: '', morning: '', afternoon: '', evening: '', note: '', sortOrder: 0 };
  return {
    id: r.id as number,
    journeyId: r.journey_id as number,
    date: r.date as string || '',
    morning: r.morning as string || '',
    afternoon: r.afternoon as string || '',
    evening: r.evening as string || '',
    note: r.note as string || '',
    sortOrder: r.sort_order as number,
  };
}

function mapSubCardRow(r: Record<string, unknown> | null): SubCard {
  if (!r) return {} as SubCard;
  return {
    id: r.id as string,
    journeyId: r.journey_id as number,
    name: r.name as string || '',
    province: r.province as string || '',
    city: r.city as string || '',
    country: r.country as string || '中国',
    date: r.date as string || '',
    endDate: r.end_date as string || '',
    emoji: r.emoji as string || '📍',
    story: r.story as string || '',
    photoKey: r.photo_key as string || null,
    photoUrl: undefined,
    sortOrder: r.sort_order as number || 0,
    highlights: [],
    costs: { packageFee: 0, transportFee: 0, accommodationFee: 0, foodFee: 0, shoppingFee: 0, ticketFee: 0 },
    itineraryTable: { headers: [], rows: [] },
  };
}

function mapWishlistRow(r: Record<string, unknown> | null) {
  if (!r) return {} as WishlistItem;
  return {
    id: r.id as number,
    title: r.title as string || '',
    city: r.city as string || '',
    emoji: r.emoji as string || '✈️',
    duration: r.duration as string || '',
    season: r.season as string || '',
    description: r.description as string || '',
    sortOrder: r.sort_order as number || 0,
    highlights: [],
  };
}
