import { createApiApp } from '../../src/lib/api-app';

const app = createApiApp();

export const onRequest = app.fetch;
