/**
 * 认证：密码哈希 + JWT 签发/校验
 *
 * 全部使用 Web Crypto API + jose，与 Workers 运行时一致。
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 天
export const SESSION_COOKIE_NAME = 'hsn_session';

// -------- 编码工具 --------
function bytesToBase64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function base64ToBytes(b64: string): Uint8Array {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

// -------- 密码哈希（PBKDF2-SHA256）--------
export async function hashPassword(password: string, saltB64?: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = saltB64 ? base64ToBytes(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_LENGTH_BITS
  );
  return {
    hash: bytesToBase64(new Uint8Array(bits)),
    salt: bytesToBase64(saltBytes),
  };
}

export async function verifyPassword(password: string, saltB64: string, expectedHashB64: string): Promise<boolean> {
  const { hash } = await hashPassword(password, saltB64);
  if (hash.length !== expectedHashB64.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ expectedHashB64.charCodeAt(i);
  return diff === 0;
}

// -------- JWT --------
export interface SessionPayload extends JWTPayload {
  uid: number;
  username: string;
}

function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: { uid: number; username: string }, secret: string): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret(secret));
}

export async function verifySession(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(secret));
    if (typeof payload.uid !== 'number' || typeof payload.username !== 'string') return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string): string {
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].join('; ');
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
