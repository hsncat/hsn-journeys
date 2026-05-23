import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';
import {
  type CostObject,
  type ItineraryTable,
  type SubCardDTO,
  type JourneyRow,
  type SubCardRow,
  emptyCost,
  emptyItinerary,
  listJourneys,
  getJourney,
  journeyRowToDTO,
} from '../db';
import { aggregateFromSubCards, normalizeItineraryTable } from '@/lib/itinerary';

const journeys = new Hono<AppBindings>();

// --- 公开：列表 ---
journeys.get('/', async (c) => {
  const list = await listJourneys(c.env.DB);
  return c.json({ journeys: list });
});

// --- 公开：详情 ---
journeys.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  const j = await getJourney(c.env.DB, id);
  if (!j) return c.json({ error: 'not_found' }, 404);
  return c.json({ journey: j });
});

// --- 管理员：新建 ---
interface CreateJourneyBody {
  province?: string;
  city?: string;
  country?: string;
  date?: string;
  endDate?: string;
  title?: string;
  emoji?: string | null;
  description?: string | null;
  story?: string | null;
  highlights?: string[];
  cost?: Partial<CostObject>;
  photoUrl?: string | null;
}

journeys.post('/', requireAdmin, async (c) => {
  let body: CreateJourneyBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  const { province, city, country, date, endDate, title } = body;
  if (!province || !city || !country || !date || !endDate || !title) {
    return c.json({ error: 'missing_fields' }, 400);
  }
  const cost = { ...emptyCost(), ...(body.cost ?? {}) };
  const result = await c.env.DB.prepare(
    `INSERT INTO journeys (province, city, country, date, end_date, title, emoji, description, story, highlights_json, cost_json, photo_url, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
     RETURNING id`
  ).bind(
    province, city, country, date, endDate, title,
    body.emoji ?? null,
    body.description ?? null,
    body.story ?? null,
    JSON.stringify(body.highlights ?? []),
    JSON.stringify(cost),
    body.photoUrl ?? null,
  ).first<{ id: number }>();

  if (!result) return c.json({ error: 'insert_failed' }, 500);

  // 自动创建一个 default sub_card
  const subId = `sub-${result.id}-default`;
  await c.env.DB.prepare(
    `INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, highlights_json, itinerary_table_json, cost_json, photo_url, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
  ).bind(
    subId, result.id, city, province, city, country, date, endDate,
    body.emoji ?? null,
    body.story ?? null,
    JSON.stringify(body.highlights ?? []),
    JSON.stringify(emptyItinerary()),
    JSON.stringify(cost),
    body.photoUrl ?? null,
  ).run();

  const created = await getJourney(c.env.DB, result.id);
  return c.json({ journey: created }, 201);
});

// --- 管理员：更新 ---
journeys.put('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  let body: Partial<CreateJourneyBody>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }

  const existing = await c.env.DB.prepare('SELECT * FROM journeys WHERE id = ?').bind(id).first<JourneyRow>();
  if (!existing) return c.json({ error: 'not_found' }, 404);

  const newCost = body.cost !== undefined
    ? { ...emptyCost(), ...body.cost }
    : null;

  await c.env.DB.prepare(
    `UPDATE journeys SET
      province = COALESCE(?, province),
      city = COALESCE(?, city),
      country = COALESCE(?, country),
      date = COALESCE(?, date),
      end_date = COALESCE(?, end_date),
      title = COALESCE(?, title),
      emoji = ?,
      description = ?,
      story = ?,
      highlights_json = COALESCE(?, highlights_json),
      cost_json = COALESCE(?, cost_json),
      photo_url = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).bind(
    body.province ?? null,
    body.city ?? null,
    body.country ?? null,
    body.date ?? null,
    body.endDate ?? null,
    body.title ?? null,
    body.emoji === undefined ? existing.emoji : (body.emoji ?? null),
    body.description === undefined ? existing.description : (body.description ?? null),
    body.story === undefined ? existing.story : (body.story ?? null),
    body.highlights ? JSON.stringify(body.highlights) : null,
    newCost ? JSON.stringify(newCost) : null,
    body.photoUrl === undefined ? existing.photo_url : (body.photoUrl ?? null),
    id,
  ).run();

  const updated = await getJourney(c.env.DB, id);
  return c.json({ journey: updated });
});

// --- 管理员：删除 ---
journeys.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  await c.env.DB.prepare('DELETE FROM journeys WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
});

// --- 管理员：从 sub_cards 重新聚合 journey ---
journeys.post('/:id/resync', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  const j = await getJourney(c.env.DB, id);
  if (!j) return c.json({ error: 'not_found' }, 404);
  const agg = aggregateFromSubCards(j.subCards, j);
  await c.env.DB.prepare(
    `UPDATE journeys SET
      province = ?, city = ?, country = ?, date = ?, end_date = ?,
      emoji = ?, highlights_json = ?, cost_json = ?, photo_url = ?,
      story = COALESCE(?, story),
      updated_at = datetime('now')
     WHERE id = ?`
  ).bind(
    agg.province ?? j.province,
    agg.city ?? j.city,
    agg.country ?? j.country,
    agg.date ?? j.date,
    agg.endDate ?? j.endDate,
    agg.emoji ?? j.emoji,
    JSON.stringify(agg.highlights ?? j.highlights),
    JSON.stringify(agg.cost ?? j.cost),
    agg.photoUrl ?? j.photoUrl,
    agg.story ?? null,
    id,
  ).run();
  const updated = await getJourney(c.env.DB, id);
  return c.json({ journey: updated });
});

export default journeys;
