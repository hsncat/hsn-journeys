import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';
import {
  type CostObject,
  type SubCardDTO,
  type JourneyRow,
  emptyCost,
  emptyItinerary,
  listJourneys,
  getJourney,
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
  subCards?: Partial<SubCardDTO>[];
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

  const initialSubCards = body.subCards?.length ? body.subCards : [{
    name: city,
    province,
    city,
    country,
    date,
    endDate,
    emoji: body.emoji ?? null,
    story: body.story ?? null,
    highlights: body.highlights ?? [],
    itineraryTable: emptyItinerary(),
    cost,
    photoUrl: body.photoUrl ?? null,
  }];

  for (const [index, sub] of initialSubCards.entries()) {
    const subCost = { ...emptyCost(), ...(sub.cost ?? {}) };
    const itin = normalizeItineraryTable(sub.itineraryTable ?? emptyItinerary());
    const subId = initialSubCards.length === 1
      ? `sub-${result.id}-default`
      : `sub-${result.id}-${index + 1}`;
    await c.env.DB.prepare(
      `INSERT INTO sub_cards (id, journey_id, name, province, city, country, date, end_date, emoji, story, highlights_json, itinerary_table_json, cost_json, photo_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      subId,
      result.id,
      sub.name || sub.city || city,
      sub.province ?? province,
      sub.city ?? city,
      sub.country ?? country,
      sub.date ?? date,
      sub.endDate ?? endDate,
      sub.emoji ?? body.emoji ?? null,
      sub.story ?? body.story ?? null,
      JSON.stringify(sub.highlights ?? body.highlights ?? []),
      JSON.stringify(itin),
      JSON.stringify(subCost),
      sub.photoUrl ?? body.photoUrl ?? null,
      sub.sortOrder ?? index,
    ).run();
  }

  let created = await getJourney(c.env.DB, result.id);
  if (created) {
    const agg = aggregateFromSubCards(created.subCards, created);
    await c.env.DB.prepare(
      `UPDATE journeys SET
        province = ?, city = ?, country = ?, date = ?, end_date = ?, title = ?,
        emoji = ?, highlights_json = ?, cost_json = ?, photo_url = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    ).bind(
      agg.province ?? created.province,
      agg.city ?? created.city,
      agg.country ?? created.country,
      agg.date ?? created.date,
      agg.endDate ?? created.endDate,
      agg.title ?? created.title,
      agg.emoji ?? created.emoji,
      JSON.stringify(agg.highlights ?? created.highlights),
      JSON.stringify(agg.cost ?? created.cost),
      agg.photoUrl ?? created.photoUrl,
      result.id,
    ).run();
    created = await getJourney(c.env.DB, result.id);
  }
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
      province = ?, city = ?, country = ?, date = ?, end_date = ?, title = ?,
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
    agg.title ?? j.title,
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
