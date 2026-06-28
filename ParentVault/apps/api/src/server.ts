/**
 * PARENTVAULT-COMMENTARY
 *
 * Bootstraps the Fastify server for the API scaffold.
 *
 * This file should remain boring and predictable: configure server, register routes, start listening, and surface startup errors.
 *
 * Do not put business logic or secrets here; keep them in dedicated services/config.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import cors from '@fastify/cors';
import Fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import { createBackendFromEnv } from './backend.js';
import { registerRoutes } from './routes.js';

export async function buildServer() {
  // Fastify instance owns HTTP routing/logging for the API scaffold.
  const app = Fastify({ logger: true });
  // Backend adapter is selected from env so hosted and self-hosted modes can share routes.
  const backend = createBackendFromEnv();

  // CORS is open for the prototype so local mobile/web clients can call the API during development.
  await app.register(cors, {
    origin: true,
    credentials: true
  });

  // All route handlers live in routes.ts; server.ts stays focused on bootstrapping.
  await registerRoutes(app, backend);

  return app;
}

async function start() {
  // Build first so any registration/config errors fail before listening.
  const app = await buildServer();
  // PORT/HOST allow local development and container/self-hosted deployment to use different bindings.
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  // Only auto-start when this module is executed directly, not when imported by tests.
  void start();
}
