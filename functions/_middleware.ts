// ============================================================
// API Auth Middleware — Pages Functions
// Validates JWT for protected routes, passes through for public GETs
// ============================================================

import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';

// Routes that don't need auth
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register'];

// GET methods that are public
const PUBLIC_PATTERNS = [
  /^\/api\/journeys$/,
  /^\/api\/journeys\/\d+$/,
  /^\/api\/wishlist$/,
  /^\/api\/packing$/,
  /^\/api\/coordinates$/,
  /^\/api\/stats$/,
];

function isPublic(request: Request): boolean {
  const url = new URL(request.url);
  const path = url.pathname;

  if (PUBLIC_ROUTES.includes(path)) return true;
  if (request.method === 'GET' && PUBLIC_PATTERNS.some((p) => p.test(path))) return true;
  return false;
}

export const auth = createMiddleware(async (c, next) => {
  const req = c.req.raw;

  if (isPublic(req)) {
    return next();
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    c.set('user', payload);
    return next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});
