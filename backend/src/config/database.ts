// Stub database plugin used for environments without a real DB plugin.
// This file exists to satisfy TypeScript and to be safely imported at runtime.
import type { FastifyInstance } from 'fastify';

export async function databasePlugin(fastify: FastifyInstance, opts?: any) {
  // no-op plugin; real projects may replace this with actual DB registration
}

export default databasePlugin;
