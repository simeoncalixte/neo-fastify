import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';

// Mock the NeoService before importing anything that uses it
jest.mock('../services/neo.service', () => ({
  __esModule: true,
  default: {
    NeoFeed: jest.fn(),
    getNeoBrowse: jest.fn(),
    getNeoLookUp: jest.fn(),
  }
}));

import NeoService from '../services/neo.service';
import { createServer } from '../server';
import { FastifyInstance } from 'fastify';
import { clearCache, getCacheSize } from '../decorators/cache';

describe('NEO Routes Caching', () => {
  let server: FastifyInstance;
  let sampleNEO: any;

  beforeAll(async () => {
    sampleNEO = {
      links: { self: 'http://example/neo/1' },
      id: '1',
      neo_reference_id: '1',
      name: 'asteroid',
      designation: 'desig',
      nasa_jpl_url: 'http://jpl',
      absolute_magnitude_h: 1,
      estimated_diameter: {
        kilometers: { estimated_diameter_min: 0.1, estimated_diameter_max: 0.2 },
        meters: { estimated_diameter_min: 100, estimated_diameter_max: 200 },
        miles: { estimated_diameter_min: 0.01, estimated_diameter_max: 0.02 },
        feet: { estimated_diameter_min: 300, estimated_diameter_max: 600 },
      },
      is_potentially_hazardous_asteroid: false,
      close_approach_data: [
        {
          close_approach_date: '2020-01-01',
          close_approach_date_full: '2020-01-01 00:00',
          epoch_date_close_approach: 0,
          relative_velocity: { kilometers_per_second: '1', kilometers_per_hour: '3600', miles_per_hour: '2237' },
          miss_distance: { astronomical: '0.1', lunar: '10', kilometers: '15000000', miles: '9000000' },
          orbiting_body: 'Earth',
        },
      ],
      orbital_data: {
        orbit_id: '1',
        orbit_determination_date: '2020-01-01',
        first_observation_date: '2020-01-01',
        last_observation_date: '2020-01-02',
        data_arc_in_days: 1,
        observations_used: 1,
        orbit_uncertainty: '1',
        minimum_orbit_intersection: '0.1',
        jupiter_tisserand_invariant: '3',
        epoch_osculation: '2020-01-01',
        eccentricity: '0.1',
        semi_major_axis: '1',
        inclination: '1',
        ascending_node_longitude: '1',
        orbital_period: '365',
        perihelion_distance: '0.9',
        perihelion_argument: '1',
        aphelion_distance: '1.1',
        perihelion_time: 'time',
        mean_anomaly: '1',
        mean_motion: '1',
        equinox: 'J2000',
        orbit_class: { orbit_class_type: 'type', orbit_class_description: 'desc', orbit_class_range: 'range' },
      },
      is_sentry_object: false,
    };

    server = await createServer({ logger: false });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    clearCache(); // Clear cache before each test
  });

  describe('GET /neo/feed caching', () => {
    it('should cache successful feed responses', async () => {
      const feedData = {
        links: { self: 'http://example' },
        element_count: 1,
        near_earth_objects: { '2020-01-01': [sampleNEO] },
      };
      (NeoService as any).NeoFeed.mockResolvedValue(feedData);

      // First request - should call the service
      const res1 = await server.inject({
        method: 'GET',
        url: '/neo/feed?start_date=2020-01-01&end_date=2020-01-02',
      });
      expect(res1.statusCode).toBe(200);
      expect((NeoService as any).NeoFeed).toHaveBeenCalledTimes(1);

      // Second request - should be served from cache
      const res2 = await server.inject({
        method: 'GET',
        url: '/neo/feed?start_date=2020-01-01&end_date=2020-01-02',
      });
      expect(res2.statusCode).toBe(200);
      expect((NeoService as any).NeoFeed).toHaveBeenCalledTimes(1); // Still only called once

      // Verify same data returned
      expect(JSON.parse(res1.payload)).toEqual(JSON.parse(res2.payload));
    });

    it('should cache separately for different date ranges', async () => {
      const feedData1 = {
        links: { self: 'http://example' },
        element_count: 1,
        near_earth_objects: { '2020-01-01': [sampleNEO] },
      };
      const feedData2 = {
        links: { self: 'http://example' },
        element_count: 2,
        near_earth_objects: { '2020-02-01': [sampleNEO, sampleNEO] },
      };

      (NeoService as any).NeoFeed
        .mockResolvedValueOnce(feedData1)
        .mockResolvedValueOnce(feedData2);

      // First date range
      const res1 = await server.inject({
        method: 'GET',
        url: '/neo/feed?start_date=2020-01-01&end_date=2020-01-02',
      });

      // Second date range
      const res2 = await server.inject({
        method: 'GET',
        url: '/neo/feed?start_date=2020-02-01&end_date=2020-02-02',
      });

      expect((NeoService as any).NeoFeed).toHaveBeenCalledTimes(2);
      expect(JSON.parse(res1.payload).data.element_count).toBe(1);
      expect(JSON.parse(res2.payload).data.element_count).toBe(2);
    });

    it('should not cache error responses for feed', async () => {
      (NeoService as any).NeoFeed.mockRejectedValue(new Error('API error'));

      // First request - should fail
      const res1 = await server.inject({
        method: 'GET',
        url: '/neo/feed?start_date=2020-01-01&end_date=2020-01-02',
      });
      expect(res1.statusCode).toBe(502);
      expect((NeoService as any).NeoFeed).toHaveBeenCalledTimes(1);

      // Second request - should also call the service (not cached)
      const res2 = await server.inject({
        method: 'GET',
        url: '/neo/feed?start_date=2020-01-01&end_date=2020-01-02',
      });
      expect(res2.statusCode).toBe(502);
      expect((NeoService as any).NeoFeed).toHaveBeenCalledTimes(2);
    });
  });

  describe('GET /neo/browse caching', () => {
    it('should cache successful browse responses', async () => {
      const browseData = {
        links: { self: 'http://example' },
        page: { size: 20, total_elements: 1, total_pages: 1, number: 0 },
        near_earth_objects: [sampleNEO],
      };
      (NeoService as any).getNeoBrowse.mockResolvedValue(browseData);

      // First request
      const res1 = await server.inject({
        method: 'GET',
        url: '/neo/browse',
      });
      expect(res1.statusCode).toBe(200);
      expect((NeoService as any).getNeoBrowse).toHaveBeenCalledTimes(1);

      // Second request - should be cached
      const res2 = await server.inject({
        method: 'GET',
        url: '/neo/browse',
      });
      expect(res2.statusCode).toBe(200);
      expect((NeoService as any).getNeoBrowse).toHaveBeenCalledTimes(1);

      expect(JSON.parse(res1.payload)).toEqual(JSON.parse(res2.payload));
    });

    it('should cache separately for different pagination params', async () => {
      const page0Data = {
        links: { self: 'http://example' },
        page: { size: 20, total_elements: 100, total_pages: 5, number: 0 },
        near_earth_objects: [sampleNEO],
      };
      const page1Data = {
        links: { self: 'http://example' },
        page: { size: 20, total_elements: 100, total_pages: 5, number: 1 },
        near_earth_objects: [{ ...sampleNEO, id: '2' }],
      };

      (NeoService as any).getNeoBrowse
        .mockResolvedValueOnce(page0Data)
        .mockResolvedValueOnce(page1Data);

      // Page 0
      const res1 = await server.inject({
        method: 'GET',
        url: '/neo/browse?page=0',
      });

      // Page 1
      const res2 = await server.inject({
        method: 'GET',
        url: '/neo/browse?page=1',
      });

      expect((NeoService as any).getNeoBrowse).toHaveBeenCalledTimes(2);
      expect(JSON.parse(res1.payload).data.page.number).toBe(0);
      expect(JSON.parse(res2.payload).data.page.number).toBe(1);
    });
  });

  describe('GET /neo/lookup/:id caching', () => {
    it('should cache successful lookup responses', async () => {
      (NeoService as any).getNeoLookUp.mockResolvedValue(sampleNEO);

      // First request
      const res1 = await server.inject({
        method: 'GET',
        url: '/neo/lookup/123',
      });
      expect(res1.statusCode).toBe(200);
      expect((NeoService as any).getNeoLookUp).toHaveBeenCalledTimes(1);

      // Second request - should be cached
      const res2 = await server.inject({
        method: 'GET',
        url: '/neo/lookup/123',
      });
      expect(res2.statusCode).toBe(200);
      expect((NeoService as any).getNeoLookUp).toHaveBeenCalledTimes(1);

      expect(JSON.parse(res1.payload)).toEqual(JSON.parse(res2.payload));
    });

    it('should cache separately for different asteroid IDs', async () => {
      const neo1 = { ...sampleNEO, id: '123' };
      const neo2 = { ...sampleNEO, id: '456' };

      (NeoService as any).getNeoLookUp
        .mockResolvedValueOnce(neo1)
        .mockResolvedValueOnce(neo2);

      // First asteroid
      const res1 = await server.inject({
        method: 'GET',
        url: '/neo/lookup/123',
      });

      // Second asteroid
      const res2 = await server.inject({
        method: 'GET',
        url: '/neo/lookup/456',
      });

      expect((NeoService as any).getNeoLookUp).toHaveBeenCalledTimes(2);
      expect(JSON.parse(res1.payload).data.id).toBe('123');
      expect(JSON.parse(res2.payload).data.id).toBe('456');
    });

    it('should not cache 400 error responses for invalid IDs', async () => {
      // Invalid ID requests return 400 without calling the service
      const res1 = await server.inject({
        method: 'GET',
        url: '/neo/lookup/abc',
      });
      expect(res1.statusCode).toBe(400);

      const res2 = await server.inject({
        method: 'GET',
        url: '/neo/lookup/abc',
      });
      expect(res2.statusCode).toBe(400);

      // Service should never be called for invalid IDs
      expect((NeoService as any).getNeoLookUp).not.toHaveBeenCalled();
    });
  });

  describe('Cache statistics', () => {
    it('should track cache size correctly', async () => {
      expect(getCacheSize()).toBe(0);

      const browseData = {
        links: { self: 'http://example' },
        page: { size: 20, total_elements: 1, total_pages: 1, number: 0 },
        near_earth_objects: [sampleNEO],
      };
      (NeoService as any).getNeoBrowse.mockResolvedValue(browseData);
      (NeoService as any).getNeoLookUp.mockResolvedValue(sampleNEO);

      await server.inject({ method: 'GET', url: '/neo/browse' });
      expect(getCacheSize()).toBe(1);

      await server.inject({ method: 'GET', url: '/neo/lookup/123' });
      expect(getCacheSize()).toBe(2);

      await server.inject({ method: 'GET', url: '/neo/lookup/456' });
      expect(getCacheSize()).toBe(3);

      // Clear and verify
      clearCache();
      expect(getCacheSize()).toBe(0);
    });
  });
});
