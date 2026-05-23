import type { Context } from 'hono';

export async function listCoordinates(c: Context) {
  const db = c.env.DB;
  const result = await db.prepare('SELECT * FROM city_coordinates ORDER BY name').all();
  return c.json(result.results.map((row: Record<string, unknown>) => ({
    id: row.id,
    name: row.name,
    country: row.country,
    lat: row.lat,
    lng: row.lng,
    type: row.type,
  })));
}

export async function createCoordinate(c: Context) {
  const body = await c.req.json();
  const { name, country, lat, lng, type } = body;
  if (!name || lat === undefined || lng === undefined) {
    return c.json({ error: 'name, lat, and lng are required' }, 400);
  }

  const db = c.env.DB;

  const dup = await db.prepare('SELECT id FROM city_coordinates WHERE name = ?').bind(name).first();
  if (dup) return c.json({ error: 'A coordinate with this name already exists' }, 409);

  const result = await db.prepare(
    'INSERT INTO city_coordinates (name, country, lat, lng, type) VALUES (?, ?, ?, ?, ?)'
  ).bind(name, country || '中国', lat, lng, type || 'domestic').run();

  return c.json({ id: result.meta.last_row_id }, 201);
}

export async function updateCoordinate(c: Context) {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM city_coordinates WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.name !== undefined) { sets.push('name = ?'); vals.push(body.name); }
  if (body.country !== undefined) { sets.push('country = ?'); vals.push(body.country); }
  if (body.lat !== undefined) { sets.push('lat = ?'); vals.push(body.lat); }
  if (body.lng !== undefined) { sets.push('lng = ?'); vals.push(body.lng); }
  if (body.type !== undefined) { sets.push('type = ?'); vals.push(body.type); }

  if (sets.length > 0) {
    vals.push(id);
    await db.prepare(`UPDATE city_coordinates SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  }

  return c.json({ success: true });
}

export async function deleteCoordinate(c: Context) {
  const id = Number(c.req.param('id'));
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM city_coordinates WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await db.prepare('DELETE FROM city_coordinates WHERE id = ?').bind(id).run();
  return c.json({ success: true });
}
