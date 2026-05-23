/**
 * 把所有 /api/* 请求转发到 Hono app
 */

import type { APIRoute } from 'astro';
import { createApp } from '@/server/app';

export const prerender = false;

const app = createApp();

export const ALL: APIRoute = async ({ request, locals }) => {
  // 让 Hono 拿到 env binding
  return app.fetch(request, locals.runtime.env, locals.runtime.ctx);
};
