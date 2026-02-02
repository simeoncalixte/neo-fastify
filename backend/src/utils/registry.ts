import { FastifyInstance } from 'fastify';
import path from 'path';

export async function registerDefaultRegistry(fastify: FastifyInstance, options?: { staticRoot?: string }) {
  // attach an in-memory cache for NEO browse responses (used by tests)
  if (!(fastify as any).browseCache) {
    try {
      (fastify as any).decorate('browseCache', new Map<string, any>());
    } catch (e) {
      // ignore if already decorated
    }
  }
  // CORS
  await fastify.register(import('@fastify/cors'), { origin: true });

  // Multipart for file uploads
  {
    const { default: multipart } = await import('@fastify/multipart');
    await fastify.register(multipart, {
      attachFieldsToBody: true,
      limits: { fileSize: 5 * 1024 * 1024 }
    });
  }

  // Security headers
  await fastify.register(import('@fastify/helmet'), {
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });

  // Rate limiting
  await fastify.register(import('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute'
  });

  // Websocket support
  await fastify.register(import('@fastify/websocket'));

  // Static assets
  const { default: fastifyStatic } = await import('@fastify/static');
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), options?.staticRoot ?? 'public'),
    prefix: '/public/'
  });

  // Swagger / OpenAPI registration (if available)
  try {
    const { registerSwagger } = await import('./swagger');
    await registerSwagger(fastify);
  } catch (e) {
    // ignore if swagger helper not present
  }

  // Health handlers registration (if present)
  try {
    const { registerHealth, registerHandlers } = await import('./handlers');
    if (typeof registerHealth === 'function') await registerHealth(fastify);
    if (typeof registerHandlers === 'function') await registerHandlers(fastify);
  } catch (e) {
    // ignore
  }
}

export default registerDefaultRegistry;
