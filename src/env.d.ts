/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ASSETS: Fetcher;
  JWT_SECRET: string;
  PUBLIC_SITE_NAME: string;
}

declare namespace App {
  interface Locals extends Runtime {
    user?: {
      id: number;
      username: string;
    };
  }
}
