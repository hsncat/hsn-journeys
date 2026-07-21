import { Hono } from 'hono';
import type { AppBindings } from '../middleware';
import { requireAdmin } from '../middleware';
import { listCoords, type CityCoordRow } from '../db';

const coords = new Hono<AppBindings>();

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

coords.get('/', async (c) => {
  const list = await listCoords(c.env.DB);
  return c.json({ coords: list });
});

interface NominatimResult {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: {
    country?: string;
    country_code?: string;
  };
}

interface CoordBody {
  name?: string;
  country?: string;
  lat?: number;
  lng?: number;
  type?: 'domestic' | 'international';
}

coords.get('/geocode', requireAdmin, async (c) => {
  const name = (c.req.query('q') ?? '').trim();
  const country = (c.req.query('country') ?? '').trim();
  const type = c.req.query('type') === 'international' ? 'international' : 'domestic';

  if (name.length < 2) return c.json({ error: 'missing_query' }, 400);

  const searchCountry = country && country !== '国内' ? country : '中国';
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '1');
  url.searchParams.set('featureType', 'city');
  url.searchParams.set('accept-language', 'zh-CN,zh;q=0.9,en;q=0.7');
  url.searchParams.set('q', [name, searchCountry].filter(Boolean).join(', '));
  if (type === 'domestic' || searchCountry === '中国') url.searchParams.set('countrycodes', 'cn');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'hsn-journeys/1.0 (https://hsncat.fun)',
      Referer: 'https://hsncat.fun/admin/coords',
    },
  });
  if (!res.ok) return c.json({ error: 'geocode_failed' }, 502);

  const results = await res.json() as NominatimResult[];
  const first = results.find(item => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon)));
  if (!first) return c.json({ error: 'geocode_not_found' }, 404);

  return c.json({
    coord: {
      name,
      country: country || first.address?.country || (type === 'domestic' ? '中国' : ''),
      lat: Number(Number(first.lat).toFixed(6)),
      lng: Number(Number(first.lon).toFixed(6)),
      type,
      displayName: first.display_name ?? '',
      source: 'OpenStreetMap Nominatim',
    },
  });
});

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
