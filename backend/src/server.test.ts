import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createServer } from './server';

describe('Server Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    // Use the actual server factory function from our server.ts
    server = await createServer({ logger: false });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.message).toBe('Welcome to ShueApp Fastify API');
      expect(payload.version).toBe('0.0.1');
    });
  });

  describe('GET /health', () => {
    it('should return health check information', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.message).toBe('Fastify server is running');
      expect(payload.timestamp).toBeDefined();
      expect(payload.uptime).toBeDefined();
      expect(typeof payload.uptime).toBe('number');
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/non-existent-route'
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe('Route not found');
      expect(payload.message).toContain('Route GET:/non-existent-route not found');
    });
  });
});
