import { FastifyInstance, FastifyRequest, FastifyReply, RouteHandlerMethod } from 'fastify';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds, default 5 minutes
  keyGenerator?: (request: FastifyRequest) => string;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

// In-memory cache store
const cacheStore = new Map<string, CacheEntry>();

/**
 * Default key generator that creates a cache key from the URL and query parameters
 */
function defaultKeyGenerator(request: FastifyRequest): string {
  const url = request.url;
  return `cache:${url}`;
}

/**
 * Checks if a cache entry is still valid based on TTL
 */
function isCacheValid(entry: CacheEntry, ttl: number): boolean {
  return Date.now() - entry.timestamp < ttl;
}

/**
 * Creates a caching decorator for route handlers
 * @param options - Cache configuration options
 * @returns A function that wraps the route handler with caching logic
 */
export function withCache(options: CacheOptions = {}) {
  const ttl = options.ttl ?? 5 * 60 * 1000; // Default 5 minutes
  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;

  return function <T extends RouteHandlerMethod>(handler: T): RouteHandlerMethod {
    return async function cachedHandler(
      this: FastifyInstance,
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const cacheKey = keyGenerator(request);

      // Check if we have a valid cached response
      const cachedEntry = cacheStore.get(cacheKey);
      if (cachedEntry && isCacheValid(cachedEntry, ttl)) {
        request.log.debug({ cacheKey }, 'Cache hit');
        return cachedEntry.data;
      }

      // Call the original handler
      const result = await handler.call(this, request, reply);

      // Only cache successful responses (those with success: true)
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        cacheStore.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
        request.log.debug({ cacheKey }, 'Cache miss - stored result');
      }

      return result;
    };
  };
}

/**
 * Clears all entries from the cache
 */
export function clearCache(): void {
  cacheStore.clear();
}

/**
 * Clears a specific cache entry by key
 */
export function clearCacheKey(key: string): boolean {
  return cacheStore.delete(key);
}

/**
 * Gets the current cache size
 */
export function getCacheSize(): number {
  return cacheStore.size;
}

/**
 * Gets a cache entry (for testing purposes)
 */
export function getCacheEntry(key: string): CacheEntry | undefined {
  return cacheStore.get(key);
}

/**
 * Checks if a key exists in the cache
 */
export function hasCache(key: string): boolean {
  return cacheStore.has(key);
}

export default withCache;
