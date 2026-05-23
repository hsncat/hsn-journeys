/**
 * D1 数据库工具：JSON 列自动 parse、统一 row 类型
 */

export interface JourneyRow {
  id: number;
  province: string;
  city: string;
  country: string;
  date: string;
  end_date: string;
  title: string;
  emoji: string | null;
  description: string | null;
  story: string | null;
  highlights_json: string | null;
  cost_json: string | null;
  photo_url: string | null;
  is_featured: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubCardRow {
  id: string;
  journey_id: number;
  name: string;
  province: string | null;
  city: string | null;
  country: string | null;
  date: string;
  end_date: string | null;
  emoji: string | null;
  story: string | null;
  highlights_json: string | null;
  itinerary_table_json: string | null;
  cost_json: string | null;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistRow {
  id: number;
  title: string;
  city: string;
  emoji: string | null;
  season: string | null;
  duration: string | null;
  description: string | null;
  highlights_json: string | null;
  sort_order: number;
}

export interface CityCoordRow {
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: 'domestic' | 'international';
  updated_at: string;
}

export interface PackingRow {
  id: number;
  category: string;
  item: string;
  note: string | null;
  is_overseas_only: number;
  sort_order: number;
}

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  password_salt: string;
  created_at: string;
  updated_at: string;
}

// -------- DTO（API 响应/前端使用的形态）--------
export interface CostObject {
  package: number;
  transport: number;
  accommodation: number;
  food: number;
  shopping: number;
  ticket: number;
}

export interface ItineraryTable {
  headers: string[];
  rows: (string | number)[][];
}

export interface SubCardDTO {
  id: string;
  journeyId: number;
  name: string;
  province: string | null;
  city: string | null;
  country: string | null;
  date: string;
  endDate: string | null;
  emoji: string | null;
  story: string | null;
  highlights: string[];
  itineraryTable: ItineraryTable;
  cost: CostObject;
  photoUrl: string | null;
  sortOrder: number;
}

export interface JourneyDTO {
  id: number;
  province: string;
  city: string;
  country: string;
  date: string;
  endDate: string;
  title: string;
  emoji: string | null;
  description: string | null;
  story: string | null;
  highlights: string[];
  cost: CostObject;
  photoUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  subCards: SubCardDTO[];
}

export interface WishlistDTO {
  id: number;
  title: string;
  city: string;
  emoji: string | null;
  season: string | null;
  duration: string | null;
  description: string | null;
  highlights: string[];
  sortOrder: number;
}

// -------- 默认值 --------
export const emptyCost = (): CostObject => ({
  package: 0,
  transport: 0,
  accommodation: 0,
  food: 0,
  shopping: 0,
  ticket: 0,
});

export const emptyItinerary = (): ItineraryTable => ({
  headers: ['日期', '上午', '下午', '备注'],
  rows: [],
});

// -------- JSON 解析 --------
function parseJSON<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

// -------- Row → DTO 转换 --------
export function rowToCost(row: { cost_json: string | null }): CostObject {
  const parsed = parseJSON<Partial<CostObject>>(row.cost_json, {});
  return { ...emptyCost(), ...parsed };
}

export function rowToHighlights(row: { highlights_json: string | null }): string[] {
  return parseJSON<string[]>(row.highlights_json, []);
}

export function rowToItinerary(row: { itinerary_table_json: string | null }): ItineraryTable {
  return parseJSON<ItineraryTable>(row.itinerary_table_json, emptyItinerary());
}

export function subCardRowToDTO(row: SubCardRow): SubCardDTO {
  return {
    id: row.id,
    journeyId: row.journey_id,
    name: row.name,
    province: row.province,
    city: row.city,
    country: row.country,
    date: row.date,
    endDate: row.end_date,
    emoji: row.emoji,
    story: row.story,
    highlights: rowToHighlights(row),
    itineraryTable: rowToItinerary(row),
    cost: rowToCost(row),
    photoUrl: row.photo_url,
    sortOrder: row.sort_order,
  };
}

export function journeyRowToDTO(row: JourneyRow, subCards: SubCardRow[]): JourneyDTO {
  return {
    id: row.id,
    province: row.province,
    city: row.city,
    country: row.country,
    date: row.date,
    endDate: row.end_date,
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    story: row.story,
    highlights: rowToHighlights(row),
    cost: rowToCost(row),
    photoUrl: row.photo_url,
    isFeatured: row.is_featured === 1,
    sortOrder: row.sort_order,
    subCards: subCards.map(subCardRowToDTO),
  };
}

export function wishlistRowToDTO(row: WishlistRow): WishlistDTO {
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    emoji: row.emoji,
    season: row.season,
    duration: row.duration,
    description: row.description,
    highlights: rowToHighlights(row),
    sortOrder: row.sort_order,
  };
}

// -------- 查询封装 --------
export async function listJourneys(db: D1Database): Promise<JourneyDTO[]> {
  const journeys = await db.prepare('SELECT * FROM journeys ORDER BY date DESC, id DESC').all<JourneyRow>();
  const subs = await db.prepare('SELECT * FROM sub_cards ORDER BY journey_id, sort_order, id').all<SubCardRow>();
  const subsByJourney = new Map<number, SubCardRow[]>();
  for (const s of subs.results ?? []) {
    const arr = subsByJourney.get(s.journey_id) ?? [];
    arr.push(s);
    subsByJourney.set(s.journey_id, arr);
  }
  return (journeys.results ?? []).map(j => journeyRowToDTO(j, subsByJourney.get(j.id) ?? []));
}

export async function getJourney(db: D1Database, id: number): Promise<JourneyDTO | null> {
  const journey = await db.prepare('SELECT * FROM journeys WHERE id = ?').bind(id).first<JourneyRow>();
  if (!journey) return null;
  const subs = await db.prepare('SELECT * FROM sub_cards WHERE journey_id = ? ORDER BY sort_order, id').bind(id).all<SubCardRow>();
  return journeyRowToDTO(journey, subs.results ?? []);
}

export async function listWishlist(db: D1Database): Promise<WishlistDTO[]> {
  const rows = await db.prepare('SELECT * FROM wishlist ORDER BY sort_order, id').all<WishlistRow>();
  return (rows.results ?? []).map(wishlistRowToDTO);
}

export async function listCoords(db: D1Database): Promise<CityCoordRow[]> {
  const rows = await db.prepare('SELECT * FROM city_coords ORDER BY type, name').all<CityCoordRow>();
  return rows.results ?? [];
}

export async function listPacking(db: D1Database): Promise<PackingRow[]> {
  const rows = await db.prepare('SELECT * FROM packing_items ORDER BY sort_order, id').all<PackingRow>();
  return rows.results ?? [];
}

export async function getSiteSettings(db: D1Database): Promise<Record<string, string>> {
  const rows = await db.prepare('SELECT key, value FROM site_settings').all<{ key: string; value: string }>();
  const obj: Record<string, string> = {};
  for (const r of rows.results ?? []) obj[r.key] = r.value;
  return obj;
}
