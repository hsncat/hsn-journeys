/**
 * Admin Password Hash Generator
 *
 * 使用 Web Crypto API（与 Workers 运行时一致）生成 PBKDF2 哈希。
 * 输出可直接 wrangler d1 execute 执行的 INSERT 语句。
 *
 * 用法：
 *   tsx scripts/hash-password.ts <username> <password>
 *   tsx scripts/hash-password.ts        # 交互输入
 */

import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const ITERATIONS = 100_000;
const HASH_ALGO = 'SHA-256';
const KEY_LENGTH_BITS = 256;

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

function base64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

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
    { name: 'PBKDF2', salt: saltBytes, iterations: ITERATIONS, hash: HASH_ALGO },
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
  // 时间常量比较
  if (hash.length !== expectedHashB64.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ expectedHashB64.charCodeAt(i);
  return diff === 0;
}

// -------- CLI --------
async function main() {
  let username = process.argv[2];
  let password = process.argv[3];

  if (!username || !password) {
    const rl = createInterface({ input: stdin, output: stdout });
    if (!username) username = await rl.question('用户名 [admin]: ') || 'admin';
    if (!password) password = await rl.question('密码: ');
    rl.close();
  }

  if (!password) {
    console.error('错误：密码不能为空');
    process.exit(1);
  }

  const { hash, salt } = await hashPassword(password);

  console.log('');
  console.log('--- 复制下面这条 SQL，用 D1 query API 或 wrangler d1 execute 执行 ---');
  console.log('');
  console.log(`INSERT INTO users (username, password_hash, password_salt) VALUES ('${username}', '${hash}', '${salt}')`);
  console.log(`  ON CONFLICT(username) DO UPDATE SET password_hash='${hash}', password_salt='${salt}', updated_at=datetime('now');`);
  console.log('');
}

// 直接运行时执行（被 import 时不执行）
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => { console.error(err); process.exit(1); });
}
