import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';

// Health check response schema
const HealthResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  timestamp: Type.String(),
  uptime: Type.Number(),
  services: Type.Object({
    database: Type.Union([
      Type.Literal('connected'),
      Type.Literal('disconnected'),
      Type.Literal('unknown')
    ])
  })
});

export function errorHandler(this: FastifyInstance, error: Error, request: FastifyRequest, reply: FastifyReply) {
  this.log.error(error);
  reply.status(500).send({
    success: false,
    error: 'Internal Server Error',
    message: error.message
  });
}

export function notFoundHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  reply.status(404).send({
    success: false,
    error: 'Route not found',
    message: `Route ${request.method}:${request.url} not found`
  });
}

export async function registerHandlers(fastify: FastifyInstance) {
  // Attach handlers using the exported functions. Casts to any to avoid
  // strict signature mismatches when passing the function references.
  fastify.setErrorHandler(errorHandler as any);
  fastify.setNotFoundHandler(notFoundHandler as any);
}

export async function registerHealth(fastify: FastifyInstance) {
  fastify.get('/health', {
    schema: {
      response: {
        200: HealthResponseSchema
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Check database connection via prisma attached by the database plugin
    let dbStatus: 'connected' | 'disconnected' | 'unknown' = 'unknown';
    try {
      await (fastify as any).prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
    }

    return {
      success: true,
      message: 'Fastify server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
      }
    };
  });
}
