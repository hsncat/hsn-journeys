/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DB: D1Database;
        PHOTOS?: R2Bucket;
        JWT_SECRET?: string;
        REGISTRATION_INVITE_CODE?: string;
        DEPLOY_HOOK_URL?: string;
        PHOTOS_BUCKET_URL?: string;
        SESSION?: KVNamespace;
      };
      [key: string]: unknown;
    };
  }
}
