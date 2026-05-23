import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';
import { listPacking, type PackingRow } from '../db';

const packing = new Hono<AppBindings>();

packing.get('/', async (c) => {
  const list = await listPacking(c.env.DB);
  return c.json({ items: list });
});

interface PackingBody {
  category?: string;
  item?: string;
  note?: string | null;
  is_overseas_only?: number;
  sort_order?: number;
}

packing.post('/', requireAdmin, async (c) => {
  let body: PackingBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  if (!body.item) return c.json({ error: 'missing_fields' }, 400);
  const row = await c.env.DB.prepare(
    `INSERT INTO packing_items (category, item, note, is_overseas_only, sort_order)
     VALUES (?, ?, ?, ?, ?)
     RETURNING *`
  ).bind(
    body.category ?? '全部',
    body.item,
    body.note ?? null,
    body.is_overseas_only ?? 0,
    body.sort_order ?? 0,
  ).first<PackingRow>();
  return c.json({ item: row }, 201);
});

packing.put('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  let body: PackingBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  const existing = await c.env.DB.prepare('SELECT * FROM packing_items WHERE id = ?').bind(id).first<PackingRow>();
  if (!existing) return c.json({ error: 'not_found' }, 404);
  await c.env.DB.prepare(
    `UPDATE packing_items SET
      category = COALESCE(?, category),
      item = COALESCE(?, item),
      note = ?,
      is_overseas_only = COALESCE(?, is_overseas_only),
      sort_order = COALESCE(?, sort_order)
     WHERE id = ?`
  ).bind(
    body.category ?? null,
    body.item ?? null,
    body.note === undefined ? existing.note : body.note,
    body.is_overseas_only ?? null,
    body.sort_order ?? null,
    id,
  ).run();
  const row = await c.env.DB.prepare('SELECT * FROM packing_items WHERE id = ?').bind(id).first<PackingRow>();
  return c.json({ item: row });
});

packing.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  await c.env.DB.prepare('DELETE FROM packing_items WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
});

export default packing;
