import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';
import { listCoords, type CityCoordRow } from '../db';

const coords = new Hono<AppBindings>();

coords.get('/', async (c) => {
  const list = await listCoords(c.env.DB);
  return c.json({ coords: list });
});

interface CoordBody {
  name?: string;
  country?: string;
  lat?: number;
  lng?: number;
  type?: 'domestic' | 'international';
}

coords.put('/:name', requireAdmin, async (c) => {
  const name = decodeURIComponent(c.req.param('name'));
  let body: CoordBody;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_body' }, 400); }
  if (!body.country || typeof body.lat !== 'number' || typeof body.lng !== 'number' || !body.type) {
    return c.json({ error: 'missing_fields' }, 400);
  }
  await c.env.DB.prepare(
    `INSERT INTO city_coords (name, country, lat, lng, type, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(name) DO UPDATE SET
       country = excluded.country, lat = excluded.lat, lng = excluded.lng,
       type = excluded.type, updated_at = datetime('now')`
  ).bind(name, body.country, body.lat, body.lng, body.type).run();
  const row = await c.env.DB.prepare('SELECT * FROM city_coords WHERE name = ?').bind(name).first<CityCoordRow>();
  return c.json({ coord: row });
});

coords.delete('/:name', requireAdmin, async (c) => {
  const name = decodeURIComponent(c.req.param('name'));
  await c.env.DB.prepare('DELETE FROM city_coords WHERE name = ?').bind(name).run();
  return c.json({ ok: true });
});

export default coords;
