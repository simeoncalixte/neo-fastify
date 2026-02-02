import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import NeoService from './neo.service';

describe('NeoService', () => {
	const originalFetch = (global as any).fetch;

	beforeEach(() => {
		// Use predictable API values for URL assertions
		NeoService.api_key = 'TESTKEY';
		NeoService.api_url = 'https://api.test/';
	});

	afterEach(() => {
		(global as any).fetch = originalFetch;
		jest.restoreAllMocks();
	});

	describe('NeoFeed', () => {
		it('returns data when fetch succeeds', async () => {
			const mockData = { near_earth_objects: {} };
			(global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => mockData });

			const res = await NeoService.NeoFeed('2020-01-01', '2020-01-02');

			expect(res).toEqual(mockData);
			expect((global as any).fetch).toHaveBeenCalledWith(
				`${NeoService.api_url}neo/rest/v1/feed?start_date=2020-01-01&end_date=2020-01-02&api_key=${NeoService.api_key}`
			);
		});

		it('throws when fetch returns non-ok', async () => {
			(global as any).fetch = jest.fn().mockResolvedValue({ ok: false });
			await expect(NeoService.NeoFeed('a', 'b')).rejects.toThrow('Failed to fetch NEO data');
		});

		it('throws when fetch rejects', async () => {
			(global as any).fetch = jest.fn().mockRejectedValue(new Error('network'));
			await expect(NeoService.NeoFeed('a', 'b')).rejects.toThrow('Failed to fetch NEO data');
		});
	});

	describe('getNeoLookUp', () => {
		it('returns data when fetch succeeds', async () => {
			const mockData = { page: {} };
			(global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => mockData });

				const res = await NeoService.getNeoLookUp(3542519);

				expect(res).toEqual(mockData);
				expect((global as any).fetch).toHaveBeenCalledWith(
					`${NeoService.api_url}neo/rest/v1/neo/3542519?api_key=${NeoService.api_key}`
				);
		});

		it('throws when fetch returns non-ok', async () => {
			(global as any).fetch = jest.fn().mockResolvedValue({ ok: false });
			await expect(NeoService.getNeoLookUp(1)).rejects.toThrow('Failed to fetch NEO data');
		});
	});

	describe('getNeoBrowse', () => {
		it('returns data when fetch succeeds', async () => {
			const mockData = { results: [] };
			(global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => mockData });

			const res = await NeoService.getNeoBrowse();

			expect(res).toEqual(mockData);
			expect((global as any).fetch).toHaveBeenCalledWith(
				`${NeoService.api_url}neo/rest/v1/neo/browse?api_key=${NeoService.api_key}`
			);
		});

		it('throws when fetch returns non-ok', async () => {
			(global as any).fetch = jest.fn().mockResolvedValue({ ok: false });
			await expect(NeoService.getNeoBrowse()).rejects.toThrow('Failed to fetch NEO data');
		});

		it('includes pagination params when provided', async () => {
			const mockData = { results: [] };
			(global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => mockData });

			const res = await NeoService.getNeoBrowse(2);

			expect(res).toEqual(mockData);
			expect((global as any).fetch).toHaveBeenCalledWith(
				`${NeoService.api_url}neo/rest/v1/neo/browse?api_key=${NeoService.api_key}&page=2&size=20`
			);
		});
	});
});