import type { Context } from 'hono';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function login(c: Context) {
  const { username, password } = await c.req.json();
  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400);
  }

  const db = c.env.DB;
  const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  if (!user) {
    return c.json({ error: 'Invalid username or password' }, 401);
  }

  const valid = bcrypt.compareSync(password, user.password_hash as string);
  if (!valid) {
    return c.json({ error: 'Invalid username or password' }, 401);
  }

  const secret = getSecretKey(c.env.JWT_SECRET);
  const token = await new SignJWT({ sub: user.id, username: user.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  return c.json({ token, username: user.username });
}

export async function register(c: Context) {
  const { username, password, inviteCode } = await c.req.json();
  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400);
  }
  if (!inviteCode || inviteCode !== c.env.REGISTRATION_INVITE_CODE) {
    return c.json({ error: 'Invalid invite code' }, 403);
  }

  const db = c.env.DB;

  // Check if any user already exists
  const existing = await db.prepare('SELECT COUNT(*) as c FROM users').first();
  if ((existing as Record<string, number>).c > 0) {
    return c.json({ error: 'Registration is closed' }, 403);
  }

  // Check username uniqueness
  const dup = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (dup) {
    return c.json({ error: 'Username already taken' }, 409);
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = await db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).bind(username, passwordHash).run();

  const secret = getSecretKey(c.env.JWT_SECRET);
  const token = await new SignJWT({ sub: result.meta.last_row_id, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  return c.json({ token, username }, 201);
}

export async function me(c: Context) {
  const user = c.get('user');
  return c.json({ username: user?.username });
}
