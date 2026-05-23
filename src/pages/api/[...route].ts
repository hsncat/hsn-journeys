// ============================================================
// Astro API endpoint — forwards /api/* to Hono
// This integrates the Hono router into the Astro SSR worker
// ============================================================

export const prerender = false;

import type { APIRoute } from 'astro';
import { createApiApp } from '@lib/api-app';

const api = createApiApp();

export const ALL: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime;
  const env = runtime?.env || {};
  return api.fetch(request, env);
};
