import type { Context } from 'hono';

export async function getStats(c: Context) {
  const db = c.env.DB;

  const [[jr], [cr], [costSum], [photoCount], [countryCount]] = await Promise.all([
    db.prepare('SELECT COUNT(*) as c FROM journeys').all(),
    db.prepare('SELECT COUNT(DISTINCT city) as c FROM journeys').all(),
    db.prepare(
      'SELECT SUM(package_fee + transport_fee + accommodation_fee + food_fee + shopping_fee + ticket_fee) as total FROM costs'
    ).all(),
    db.prepare("SELECT COUNT(*) as c FROM journeys WHERE photo_key IS NOT NULL AND photo_key != ''").all(),
    db.prepare("SELECT COUNT(DISTINCT country) as c FROM journeys WHERE country != '' AND country != '中国'").all(),
  ]);

  return c.json({
    journeyCount: (jr.results[0] as Record<string, number>)?.c || 0,
    cityCount: (cr.results[0] as Record<string, number>)?.c || 0,
    photoCount: (photoCount.results[0] as Record<string, number>)?.c || 0,
    totalCost: (costSum.results[0] as Record<string, number>)?.total || 0,
    countryCount: (countryCount.results[0] as Record<string, number>)?.c || 0,
  });
}
