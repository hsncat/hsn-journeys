import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';
import {
  type SubCardRow,
  emptyCost,
  emptyItinerary,
  subCardRowToDTO,
  getJourney,
} from '../db';
import { aggregateFromSubCards, normalizeItineraryTable } from '@/lib/itinerary';

const subCards = new Hono<AppBindings>();

// 列表（按 journey 过滤）
subCards.get('/', async (c) => {
  const journeyId = c.req.query('journeyId');
  const sql = journeyId
    ? 'SELECT * FROM sub_cards WHERE journey_id = ? ORDER BY sort_order, id'
    : 'SELECT * FROM sub_cards ORDER BY journey_id, sort_order, id';
  const rows = journeyId
    ? await c.env.DB.prepare(sql).bind(Number(journeyId)).all<SubCardRow>()
    : await c.env.DB.prepare(sql).all<SubCardRow>();
  return c.json({ subCards: (rows.results ?? []).map(subCardRowToDTO) });
});

subCards.get('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM sub_cards WHERE id = ?').bind(id).first<SubCardRow>();
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json({ subCard: subCardRowToDTO(row) });
});

interface SubCardBody {
  journeyId?: number;
  name?: string;
  province?: string | null;
  city?: string | null;
  country?: string | null;
  date?: string;
  endDate?: string | null;
  emoji?: string | null;
  story?: string | null;
  highlights?: string[];
  itineraryTable?: { headers: string[]; rows: (string | number)[][] };
  cost?: Record<string, number>;
  photoUrl?: string | null;
  photoUrls?: string[];
  sortOrder?: number;
}

async function resyncJourney(db: D1Database, journeyId: number, preferredPhotoUrl?: string) {
  const j = await getJourney(db, journeyId);
  if (!j) return;
  const agg = aggregateFromSubCards(j.subCards, j);
  await db.prepare(
    `UPDATE journeys SET
      province = ?, city = ?, country = ?, date = ?, end_date = ?, title = ?,
      emoji = ?, highlights_json = ?, cost_json = ?, photo_url = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).bind(
    agg.province ?? j.province,
    agg.city ?? j.city,
    agg.country ?? j.country,
    agg.date ?? j.date,
    agg.endDate ?? j.endDate,
    agg.title ?? j.title,
    agg.emoji ?? j.emoji,
    JSON.stringify(agg.highlights ?? j.highlights),
    JSON.stringify(agg.cost ?? j.cost),
    preferredPhotoUrl ?? agg.photoUrl ?? j.photoUrl,
    journeyId,
  ).run();
}

// 新建
subCards.post('/', requireAdmin, async (c) => {
  let body: SubCardBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  if (!body.journeyId || !body.date || !body.name) {
    return c.json({ error: 'missing_fields' }, 400);
  }
  const id = `sub-${body.journeyId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const cost = { ...emptyCost(), ...(body.cost ?? {}) };
  const itin = normalizeItineraryTable(body.itineraryTable ?? emptyItinerary());

  await c.env.DB.prepare(
    `INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, highlights_json, itinerary_table_json, cost_json, photo_url, photo_urls_json, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, body.journeyId, body.name,
    body.province ?? null,
    body.city ?? null,
    body.country ?? null,
    body.date,
    body.endDate ?? null,
    body.emoji ?? null,
    body.story ?? null,
    JSON.stringify(body.highlights ?? []),
    JSON.stringify(itin),
    JSON.stringify(cost),
    body.photoUrl ?? null,
    JSON.stringify(normalizePhotoUrls(body.photoUrls, body.photoUrl ?? null)),
    body.sortOrder ?? 0,
  ).run();

  await resyncJourney(c.env.DB, body.journeyId, body.photoUrl ?? undefined);

  const row = await c.env.DB.prepare('SELECT * FROM sub_cards WHERE id = ?').bind(id).first<SubCardRow>();
  return c.json({ subCard: row ? subCardRowToDTO(row) : null }, 201);
});

// 更新（也支持转移到不同的 journey）
subCards.put('/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  let body: SubCardBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }

  const existing = await c.env.DB.prepare('SELECT * FROM sub_cards WHERE id = ?').bind(id).first<SubCardRow>();
  if (!existing) return c.json({ error: 'not_found' }, 404);
  const oldJourneyId = existing.journey_id;

  const cost = body.cost !== undefined ? { ...emptyCost(), ...body.cost } : null;
  const itin = body.itineraryTable !== undefined ? normalizeItineraryTable(body.itineraryTable) : null;

  await c.env.DB.prepare(
    `UPDATE sub_cards SET
      journey_id = COALESCE(?, journey_id),
      name = COALESCE(?, name),
      province = ?, city = ?, country = ?,
      date = COALESCE(?, date),
      end_date = ?,
      emoji = ?,
      story = ?,
      highlights_json = COALESCE(?, highlights_json),
      itinerary_table_json = COALESCE(?, itinerary_table_json),
      cost_json = COALESCE(?, cost_json),
      photo_url = ?,
      photo_urls_json = COALESCE(?, photo_urls_json),
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
     WHERE id = ?`
  ).bind(
    body.journeyId ?? null,
    body.name ?? null,
    body.province === undefined ? existing.province : body.province,
    body.city === undefined ? existing.city : body.city,
    body.country === undefined ? existing.country : body.country,
    body.date ?? null,
    body.endDate === undefined ? existing.end_date : body.endDate,
    body.emoji === undefined ? existing.emoji : body.emoji,
    body.story === undefined ? existing.story : body.story,
    body.highlights ? JSON.stringify(body.highlights) : null,
    itin ? JSON.stringify(itin) : null,
    cost ? JSON.stringify(cost) : null,
    body.photoUrl === undefined ? existing.photo_url : body.photoUrl,
    body.photoUrls ? JSON.stringify(normalizePhotoUrls(body.photoUrls, body.photoUrl === undefined ? existing.photo_url : body.photoUrl)) : null,
    body.sortOrder ?? null,
    id,
  ).run();

  const newJourneyId = body.journeyId ?? oldJourneyId;
  await resyncJourney(c.env.DB, newJourneyId, body.photoUrl ?? undefined);
  if (newJourneyId !== oldJourneyId) await resyncJourney(c.env.DB, oldJourneyId);

  const row = await c.env.DB.prepare('SELECT * FROM sub_cards WHERE id = ?').bind(id).first<SubCardRow>();
  return c.json({ subCard: row ? subCardRowToDTO(row) : null });
});

// 删除
subCards.delete('/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT journey_id FROM sub_cards WHERE id = ?').bind(id).first<{ journey_id: number }>();
  if (!existing) return c.json({ error: 'not_found' }, 404);
  await c.env.DB.prepare('DELETE FROM sub_cards WHERE id = ?').bind(id).run();
  await resyncJourney(c.env.DB, existing.journey_id);
  return c.json({ ok: true });
});

export default subCards;

function normalizePhotoUrls(urls: string[] | undefined, cover: string | null): string[] {
  const list = (urls ?? []).map(s => String(s).trim()).filter(Boolean);
  if (cover && !list.includes(cover)) list.unshift(cover);
  return [...new Set(list)].slice(0, 10);
}
