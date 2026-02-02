import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Ensure we have a NASA API key for live requests (uses NASA's demo key if not set)
process.env.NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
import { createServer } from '../server';
import { FastifyInstance } from 'fastify';

describe('NEO Routes', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createServer({ logger: false });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });


  it('GET /neo/feed returns 400 when missing params', async () => {
    const res = await server.inject({ method: 'GET', url: '/neo/feed' });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.message).toContain('start_date');
  });

  it('GET /neo/feed returns data on success', async () => {
    const res = await server.inject({ method: 'GET', url: '/neo/feed?start_date=2020-01-01&end_date=2020-01-02' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data).toHaveProperty('near_earth_objects');
  });

  it('GET /neo/browse returns data on success', async () => {
    const res = await server.inject({ method: 'GET', url: '/neo/browse' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data).toHaveProperty('page');
  });

  it('GET /neo/browse with pagination params returns correct page', async () => {
    // Test page 3 to ensure pagination works beyond the first couple pages
    const res = await server.inject({ method: 'GET', url: '/neo/browse?page=3&size=5' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data).toHaveProperty('page');
    expect(body.data.page.number).toBe(3);
    expect(body.data.page.size).toBe(5);
    expect(body.data.near_earth_objects.length).toBeLessThanOrEqual(5);
  });

  it('GET /neo/browse can navigate through multiple pages', async () => {
    // Fetch page 0, 1, 2, 3 and verify each returns different data
    const pages: any[] = [];
    for (let p = 0; p <= 3; p++) {
      const res = await server.inject({ method: 'GET', url: `/neo/browse?page=${p}&size=5` });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.page.number).toBe(p);
      pages.push(body.data);
    }

    // Verify each page has different NEOs (by checking first NEO id differs)
    const firstIds = pages.map(p => p.near_earth_objects[0]?.id);
    const uniqueIds = new Set(firstIds);
    expect(uniqueIds.size).toBe(4); // All 4 pages should have different first NEOs
  });


  it('GET /neo/lookup/:id returns 400 for non-number id', async () => {
    const res = await server.inject({ method: 'GET', url: '/neo/lookup/abc' });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.message).toContain('id must be a number');
  });

  it('GET /neo/lookup/:id returns data on success', async () => {
    const res = await server.inject({ method: 'GET', url: '/neo/lookup/3542519' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });


});
