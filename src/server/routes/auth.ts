import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import type { AppBindings } from '../middleware';
import { clearSessionCookie, hashPassword, sessionCookie, signSession, verifyPassword, SESSION_COOKIE_NAME } from '../auth';
import { requireAdmin, getCurrentUser } from '../middleware';
import type { UserRow } from '../db';

const auth = new Hono<AppBindings>();

auth.post('/login', async (c) => {
  let body: { username?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_body' }, 400);
  }
  const { username, password } = body;
  if (!username || !password) return c.json({ error: 'missing_credentials' }, 400);

  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).first<UserRow>();
  if (!user) return c.json({ error: 'invalid_credentials' }, 401);

  const ok = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!ok) return c.json({ error: 'invalid_credentials' }, 401);

  const token = await signSession({ uid: user.id, username: user.username }, c.env.JWT_SECRET);
  c.header('Set-Cookie', sessionCookie(token));
  return c.json({ ok: true, user: { id: user.id, username: user.username } });
});

auth.post('/logout', async (c) => {
  c.header('Set-Cookie', clearSessionCookie());
  return c.json({ ok: true });
});

auth.get('/me', async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ user: null });
  return c.json({ user: { id: user.uid, username: user.username } });
});

auth.post('/change-password', requireAdmin, async (c) => {
  let body: { oldPassword?: string; newPassword?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_body' }, 400);
  }
  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword) return c.json({ error: 'missing_fields' }, 400);
  if (newPassword.length < 8) return c.json({ error: 'password_too_short' }, 400);

  const me = c.get('user')!;
  const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(me.uid).first<UserRow>();
  if (!row) return c.json({ error: 'user_not_found' }, 404);
  const ok = await verifyPassword(oldPassword, row.password_salt, row.password_hash);
  if (!ok) return c.json({ error: 'invalid_credentials' }, 401);

  const { hash, salt } = await hashPassword(newPassword);
  await c.env.DB.prepare(
    "UPDATE users SET password_hash = ?, password_salt = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(hash, salt, me.uid).run();

  return c.json({ ok: true });
});

export default auth;
