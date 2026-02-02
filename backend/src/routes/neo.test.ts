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

describe('NEO Routes', () => {
  let server: FastifyInstance;
  let sampleNEO: any;

  beforeAll(async () => {
    // Provide default mock implementations using full schema shapes
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

    (NeoService as any).NeoFeed.mockResolvedValue({ links: { self: 'http://example' }, element_count: 1, near_earth_objects: { '2020-01-01': [sampleNEO] } });
    (NeoService as any).getNeoBrowse.mockResolvedValue({ links: { self: 'http://example' }, page: { size: 1, total_elements: 1, total_pages: 1, number: 0 }, near_earth_objects: [sampleNEO] });
    (NeoService as any).getNeoLookUp.mockResolvedValue(sampleNEO);

    server = await createServer({ logger: false });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /neo/feed returns 400 when missing params', async () => {
    const res = await server.inject({ method: 'GET', url: '/neo/feed' });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.message).toContain('start_date');
  });

  it('GET /neo/feed returns data on success', async () => {
    const expected = { links: { self: 'http://example' }, element_count: 1, near_earth_objects: { '2020-01-01': [sampleNEO] } };
    (NeoService as any).NeoFeed.mockResolvedValue(expected);
    const res = await server.inject({ method: 'GET', url: '/neo/feed?start_date=2020-01-01&end_date=2020-01-02' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(expected);
    expect((NeoService as any).NeoFeed).toHaveBeenCalledWith('2020-01-01', '2020-01-02');
  });

  it('GET /neo/browse returns data on success', async () => {
    const expected = { links: { self: 'http://example' }, page: { size: 1, total_elements: 1, total_pages: 1, number: 0 }, near_earth_objects: [sampleNEO] };
    (NeoService as any).getNeoBrowse.mockResolvedValue(expected);
    const res = await server.inject({ method: 'GET', url: '/neo/browse' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(expected);
    expect((NeoService as any).getNeoBrowse).toHaveBeenCalledWith(0, 20);
  });

  it('GET /neo/browse returns 502 when service fails', async () => {
    (NeoService as any).getNeoBrowse.mockRejectedValue(new Error('boom'));
    const res = await server.inject({ method: 'GET', url: '/neo/browse' });
    expect(res.statusCode).toBe(502);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Failed to fetch NEO browse');
  });

  it('GET /neo/lookup/:id returns 400 for non-number id', async () => {
    const res = await server.inject({ method: 'GET', url: '/neo/lookup/abc' });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.message).toContain('id must be a number');
  });

  it('GET /neo/lookup/:id returns data on success', async () => {
    const expected = sampleNEO;
    (NeoService as any).getNeoLookUp.mockResolvedValue(expected as any);
    const res = await server.inject({ method: 'GET', url: '/neo/lookup/123' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(expected);
    expect((NeoService as any).getNeoLookUp).toHaveBeenCalledWith(123);
  });
});
