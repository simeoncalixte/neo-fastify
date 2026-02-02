import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyCors from '@fastify/cors';
import { registerDefaultRegistry } from './utils/registry';
import { registerRoutesFromDir } from './utils/autoRoutes';

// Server factory function that creates and configures the Fastify instance
export async function createServer(options: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: options.logger ?? true
  });
  // Ensure JWT secret is configured and sufficiently strong
  await registerDefaultRegistry(fastify);
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return { success: true, message: 'Welcome to ShueApp Fastify API', version: '0.0.1' };
  });
  // API routes group (auto-discovered)
  await registerRoutesFromDir(fastify);
  return fastify;
}

// Start server function (only used when running directly, not in tests)
export const start = async () => {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  const HOST = process.env.HOST || '0.0.0.0';

  const server = await createServer();

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Handle graceful shutdown
  const gracefulShutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  return server;
};