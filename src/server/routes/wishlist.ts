import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';
import { listWishlist, wishlistRowToDTO, type WishlistRow } from '../db';

const wishlist = new Hono<AppBindings>();

wishlist.get('/', async (c) => {
  const list = await listWishlist(c.env.DB);
  return c.json({ wishlist: list });
});

interface WishlistBody {
  title?: string;
  city?: string;
  emoji?: string | null;
  season?: string | null;
  duration?: string | null;
  description?: string | null;
  highlights?: string[];
  sortOrder?: number;
}

wishlist.post('/', requireAdmin, async (c) => {
  let body: WishlistBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  if (!body.title || !body.city) return c.json({ error: 'missing_fields' }, 400);
  const result = await c.env.DB.prepare(
    `INSERT INTO wishlist (title, city, emoji, season, duration, description, highlights_json, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`
  ).bind(
    body.title, body.city,
    body.emoji ?? null, body.season ?? null, body.duration ?? null,
    body.description ?? null,
    JSON.stringify(body.highlights ?? []),
    body.sortOrder ?? 0,
  ).first<WishlistRow>();
  return c.json({ wishlist: result ? wishlistRowToDTO(result) : null }, 201);
});

wishlist.put('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  let body: WishlistBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  const existing = await c.env.DB.prepare('SELECT * FROM wishlist WHERE id = ?').bind(id).first<WishlistRow>();
  if (!existing) return c.json({ error: 'not_found' }, 404);

  await c.env.DB.prepare(
    `UPDATE wishlist SET
      title = COALESCE(?, title),
      city = COALESCE(?, city),
      emoji = ?, season = ?, duration = ?, description = ?,
      highlights_json = COALESCE(?, highlights_json),
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
     WHERE id = ?`
  ).bind(
    body.title ?? null,
    body.city ?? null,
    body.emoji === undefined ? existing.emoji : body.emoji,
    body.season === undefined ? existing.season : body.season,
    body.duration === undefined ? existing.duration : body.duration,
    body.description === undefined ? existing.description : body.description,
    body.highlights ? JSON.stringify(body.highlights) : null,
    body.sortOrder ?? null,
    id,
  ).run();
  const row = await c.env.DB.prepare('SELECT * FROM wishlist WHERE id = ?').bind(id).first<WishlistRow>();
  return c.json({ wishlist: row ? wishlistRowToDTO(row) : null });
});

wishlist.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  await c.env.DB.prepare('DELETE FROM wishlist WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
});

export default wishlist;
