import type { Context } from 'hono';

export async function listWishlist(c: Context) {
  const db = c.env.DB;
  const items = await db.prepare('SELECT * FROM wishlist_items ORDER BY sort_order').all();
  const result = [];

  for (const row of items.results) {
    const r = row as Record<string, unknown>;
    const hl = await db.prepare(
      'SELECT * FROM wishlist_highlights WHERE wishlist_id = ? ORDER BY sort_order'
    ).bind(r.id).all();

    result.push({
      id: r.id,
      title: r.title,
      city: r.city,
      emoji: r.emoji,
      duration: r.duration,
      season: r.season,
      description: r.description,
      sortOrder: r.sort_order,
      highlights: hl.results.map((h: Record<string, unknown>) => ({
        id: h.id,
        wishlistId: h.wishlist_id,
        text: h.text,
        sortOrder: h.sort_order,
      })),
    });
  }

  return c.json(result);
}

export async function createWishlist(c: Context) {
  const body = await c.req.json();
  const db = c.env.DB;

  const maxResult = await db.prepare('SELECT MAX(sort_order) as m FROM wishlist_items').first();
  const nextOrder = ((maxResult as Record<string, number> | null)?.m || 0) + 1;

  const result = await db.prepare(
    `INSERT INTO wishlist_items (title, city, emoji, duration, season, description, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.title || '', body.city || '', body.emoji || '✈️', body.duration || '',
    body.season || '', body.description || '', body.sortOrder ?? nextOrder
  ).run();

  const id = result.meta.last_row_id as number;

  if (body.highlights && Array.isArray(body.highlights)) {
    for (let i = 0; i < body.highlights.length; i++) {
      const h = body.highlights[i];
      await db.prepare(
        'INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (?, ?, ?)'
      ).bind(id, typeof h === 'string' ? h : h.text, i).run();
    }
  }

  return c.json({ id }, 201);
}

export async function updateWishlist(c: Context) {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM wishlist_items WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await db.prepare(
    `UPDATE wishlist_items SET title=?, city=?, emoji=?, duration=?, season=?, description=?, sort_order=?
     WHERE id=?`
  ).bind(
    body.title || '', body.city || '', body.emoji || '✈️', body.duration || '',
    body.season || '', body.description || '', body.sortOrder ?? 0, id
  ).run();

  if (body.highlights && Array.isArray(body.highlights)) {
    await db.prepare('DELETE FROM wishlist_highlights WHERE wishlist_id = ?').bind(id).run();
    for (let i = 0; i < body.highlights.length; i++) {
      const h = body.highlights[i];
      await db.prepare(
        'INSERT INTO wishlist_highlights (wishlist_id, text, sort_order) VALUES (?, ?, ?)'
      ).bind(id, typeof h === 'string' ? h : h.text, i).run();
    }
  }

  return c.json({ success: true });
}

export async function deleteWishlist(c: Context) {
  const id = Number(c.req.param('id'));
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM wishlist_items WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await db.prepare('DELETE FROM wishlist_items WHERE id = ?').bind(id).run();
  return c.json({ success: true });
}
