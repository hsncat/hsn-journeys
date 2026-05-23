/**
 * Hono 中间件：要求管理员身份
 */

import type { MiddlewareHandler, Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifySession, SESSION_COOKIE_NAME, type SessionPayload } from './auth';

export interface AppBindings {
  Bindings: Env;
  Variables: {
    user?: SessionPayload;
  };
}

export const requireAdmin: MiddlewareHandler<AppBindings> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return c.json({ error: 'unauthorized' }, 401);

  const payload = await verifySession(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'invalid_token' }, 401);

  c.set('user', payload);
  await next();
};

export async function getCurrentUser(c: Context<AppBindings>): Promise<SessionPayload | null> {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return null;
  return await verifySession(token, c.env.JWT_SECRET);
}
