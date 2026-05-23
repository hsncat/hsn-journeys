/**
 * Hono App Entry
 *
 * 所有 /api/* 路由注册在这里。
 * 通过 src/pages/api/[...path].ts 委托给本实例。
 */

import { Hono } from 'hono';
import type { AppBindings } from './middleware';
import auth from './routes/auth';
import journeys from './routes/journeys';
import subCards from './routes/sub-cards';
import wishlist from './routes/wishlist';
import coords from './routes/coords';
import packing from './routes/packing';
import photos from './routes/photos';
import { listCoords, listJourneys, listPacking, listWishlist, getSiteSettings } from './db';

export function createApp() {
  const app = new Hono<AppBindings>().basePath('/api');

  // 健康检查
  app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

  // 公开聚合数据（首页/地图等用一次拿全）
  app.get('/bootstrap', async (c) => {
    const [journeys, wishlist, coords, packing, settings] = await Promise.all([
      listJourneys(c.env.DB),
      listWishlist(c.env.DB),
      listCoords(c.env.DB),
      listPacking(c.env.DB),
      getSiteSettings(c.env.DB),
    ]);
    return c.json({ journeys, wishlist, coords, packing, settings });
  });

  // 子路由
  app.route('/auth', auth);
  app.route('/journeys', journeys);
  app.route('/sub-cards', subCards);
  app.route('/wishlist', wishlist);
  app.route('/coords', coords);
  app.route('/packing', packing);
  app.route('/photos', photos);

  // Fallback
  app.notFound((c) => c.json({ error: 'api_not_found' }, 404));
  app.onError((err, c) => {
    console.error('[API Error]', err);
    return c.json({ error: 'internal', message: err.message }, 500);
  });

  return app;
}
