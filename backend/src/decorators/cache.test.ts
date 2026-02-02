import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  withCache,
  clearCache,
  getCacheSize,
  getCacheEntry,
  hasCache,
  clearCacheKey,
} from './cache';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

// Mock request and reply objects
function createMockRequest(url: string): Partial<FastifyRequest> {
  return {
    url,
    log: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any,
  };
}

function createMockReply(): Partial<FastifyReply> {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as any;
}

describe('Cache Decorator', () => {
  beforeEach(() => {
    // Clear the cache before each test
    clearCache();
  });

  describe('withCache', () => {
    it('should cache successful responses', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: true, data: 'test data' });
      const cachedHandler = withCache()(mockHandler as any);

      const request = createMockRequest('/test');
      const reply = createMockReply();

      // First call - should execute handler
      const result1 = await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(result1).toEqual({ success: true, data: 'test data' });

      // Second call - should return cached result
      const result2 = await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      expect(mockHandler).toHaveBeenCalledTimes(1); // Still only called once
      expect(result2).toEqual({ success: true, data: 'test data' });
    });

    it('should not cache failed responses', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: false, message: 'error' });
      const cachedHandler = withCache()(mockHandler as any);

      const request = createMockRequest('/test-fail');
      const reply = createMockReply();

      // First call
      await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      expect(mockHandler).toHaveBeenCalledTimes(1);

      // Second call - should still execute handler since response wasn't cached
      await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it('should use different cache keys for different URLs', async () => {
      const mockHandler = jest.fn()
        .mockResolvedValueOnce({ success: true, data: 'data1' })
        .mockResolvedValueOnce({ success: true, data: 'data2' });
      const cachedHandler = withCache()(mockHandler as any);

      const request1 = createMockRequest('/test1');
      const request2 = createMockRequest('/test2');
      const reply = createMockReply();

      const result1 = await cachedHandler.call({} as FastifyInstance, request1 as FastifyRequest, reply as FastifyReply);
      const result2 = await cachedHandler.call({} as FastifyInstance, request2 as FastifyRequest, reply as FastifyReply);

      expect(mockHandler).toHaveBeenCalledTimes(2);
      expect(result1).toEqual({ success: true, data: 'data1' });
      expect(result2).toEqual({ success: true, data: 'data2' });
    });

    it('should respect TTL and expire cache entries', async () => {
      const mockHandler = jest.fn()
        .mockResolvedValueOnce({ success: true, data: 'old data' })
        .mockResolvedValueOnce({ success: true, data: 'new data' });
      
      // Very short TTL for testing
      const cachedHandler = withCache({ ttl: 50 })(mockHandler as any);

      const request = createMockRequest('/test-ttl');
      const reply = createMockReply();

      // First call
      const result1 = await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      expect(result1).toEqual({ success: true, data: 'old data' });
      expect(mockHandler).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second call - cache should be expired
      const result2 = await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      expect(result2).toEqual({ success: true, data: 'new data' });
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it('should use custom key generator when provided', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: true, data: 'test' });
      const customKeyGen = (req: FastifyRequest) => `custom:${req.url}`;
      const cachedHandler = withCache({ keyGenerator: customKeyGen })(mockHandler as any);

      const request = createMockRequest('/test-custom');
      const reply = createMockReply();

      await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);

      expect(hasCache('custom:/test-custom')).toBe(true);
    });

    it('should cache responses with query parameters separately', async () => {
      const mockHandler = jest.fn()
        .mockResolvedValueOnce({ success: true, data: 'page0' })
        .mockResolvedValueOnce({ success: true, data: 'page1' });
      const cachedHandler = withCache()(mockHandler as any);

      const request1 = createMockRequest('/browse?page=0');
      const request2 = createMockRequest('/browse?page=1');
      const reply = createMockReply();

      const result1 = await cachedHandler.call({} as FastifyInstance, request1 as FastifyRequest, reply as FastifyReply);
      const result2 = await cachedHandler.call({} as FastifyInstance, request2 as FastifyRequest, reply as FastifyReply);

      expect(mockHandler).toHaveBeenCalledTimes(2);
      expect(result1).toEqual({ success: true, data: 'page0' });
      expect(result2).toEqual({ success: true, data: 'page1' });
    });
  });

  describe('clearCache', () => {
    it('should clear all cache entries', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: true, data: 'test' });
      const cachedHandler = withCache()(mockHandler as any);

      const request = createMockRequest('/test-clear');
      const reply = createMockReply();

      await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      expect(getCacheSize()).toBe(1);

      clearCache();
      expect(getCacheSize()).toBe(0);
    });
  });

  describe('clearCacheKey', () => {
    it('should clear a specific cache entry', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: true, data: 'test' });
      const cachedHandler = withCache()(mockHandler as any);

      const request = createMockRequest('/test-specific');
      const reply = createMockReply();

      await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      expect(hasCache('cache:/test-specific')).toBe(true);

      const deleted = clearCacheKey('cache:/test-specific');
      expect(deleted).toBe(true);
      expect(hasCache('cache:/test-specific')).toBe(false);
    });
  });

  describe('getCacheEntry', () => {
    it('should return cache entry with timestamp', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: true, data: 'test' });
      const cachedHandler = withCache()(mockHandler as any);

      const request = createMockRequest('/test-entry');
      const reply = createMockReply();

      const before = Date.now();
      await cachedHandler.call({} as FastifyInstance, request as FastifyRequest, reply as FastifyReply);
      const after = Date.now();

      const entry = getCacheEntry('cache:/test-entry');
      expect(entry).toBeDefined();
      expect(entry?.data).toEqual({ success: true, data: 'test' });
      expect(entry?.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry?.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('getCacheSize', () => {
    it('should return correct cache size', async () => {
      expect(getCacheSize()).toBe(0);

      const mockHandler = jest.fn().mockResolvedValue({ success: true, data: 'test' });
      const cachedHandler = withCache()(mockHandler as any);
      const reply = createMockReply();

      await cachedHandler.call({} as FastifyInstance, createMockRequest('/test1') as FastifyRequest, reply as FastifyReply);
      expect(getCacheSize()).toBe(1);

      await cachedHandler.call({} as FastifyInstance, createMockRequest('/test2') as FastifyRequest, reply as FastifyReply);
      expect(getCacheSize()).toBe(2);

      await cachedHandler.call({} as FastifyInstance, createMockRequest('/test3') as FastifyRequest, reply as FastifyReply);
      expect(getCacheSize()).toBe(3);
    });
  });
});
