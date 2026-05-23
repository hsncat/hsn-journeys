/**
 * R2 公开读路由：/r2/{key} 返回桶内的对象，长缓存
 */

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request }) => {
  const env = locals.runtime.env;
  const key = (params.key || '') as string;
  if (!key || key.includes('..')) {
    return new Response('bad_key', { status: 400 });
  }

  const obj = await env.R2.get(key);
  if (!obj) {
    return new Response('not_found', { status: 404 });
  }

  // 先把内容读出来再构造响应，避开 platformProxy 跨进程的 stream 序列化问题
  const buffer = await obj.arrayBuffer();
  const contentType = obj.httpMetadata?.contentType || 'application/octet-stream';
  const cacheControl = obj.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable';

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'ETag': obj.httpEtag,
    },
  });
};

export const HEAD: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const key = (params.key || '') as string;
  if (!key || key.includes('..')) return new Response(null, { status: 400 });
  const meta = await env.R2.head(key);
  if (!meta) return new Response(null, { status: 404 });
  return new Response(null, {
    headers: {
      'Content-Type': meta.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Length': String(meta.size),
      'ETag': meta.httpEtag,
    },
  });
};
