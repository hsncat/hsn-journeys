import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';
import { concertRowToDTO, listConcerts, type ConcertRow } from '../db';

const concerts = new Hono<AppBindings>();

interface ConcertBody {
  date?: string;
  artist?: string;
  title?: string;
  venue?: string;
  cost?: number;
  sortOrder?: number;
}

concerts.get('/', async (c) => {
  const list = await listConcerts(c.env.DB);
  return c.json({ concerts: list });
});

concerts.post('/', requireAdmin, async (c) => {
  let body: ConcertBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  if (!body.date || !body.artist || !body.title || !body.venue) return c.json({ error: 'missing_fields' }, 400);
  const row = await c.env.DB.prepare(
    `INSERT INTO concerts (date, artist, title, venue, cost, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING *`
  ).bind(
    body.date,
    body.artist,
    body.title,
    body.venue,
    Number(body.cost) || 0,
    body.sortOrder ?? 0,
  ).first<ConcertRow>();
  return c.json({ concert: row ? concertRowToDTO(row) : null }, 201);
});

concerts.put('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  let body: ConcertBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  const existing = await c.env.DB.prepare('SELECT * FROM concerts WHERE id = ?').bind(id).first<ConcertRow>();
  if (!existing) return c.json({ error: 'not_found' }, 404);
  await c.env.DB.prepare(
    `UPDATE concerts SET
      date = COALESCE(?, date),
      artist = COALESCE(?, artist),
      title = COALESCE(?, title),
      venue = COALESCE(?, venue),
      cost = COALESCE(?, cost),
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
     WHERE id = ?`
  ).bind(
    body.date ?? null,
    body.artist ?? null,
    body.title ?? null,
    body.venue ?? null,
    body.cost ?? null,
    body.sortOrder ?? null,
    id,
  ).run();
  const row = await c.env.DB.prepare('SELECT * FROM concerts WHERE id = ?').bind(id).first<ConcertRow>();
  return c.json({ concert: row ? concertRowToDTO(row) : null });
});

concerts.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);
  await c.env.DB.prepare('DELETE FROM concerts WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
});

export default concerts;
