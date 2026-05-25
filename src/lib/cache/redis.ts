import { createClient, type RedisClientType } from 'redis';

/**
 * Redis caching service
 * Caches frequently accessed data like search results, session data, and corpus statistics
 */

let redisClient: RedisClientType | null = null;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEFAULT_TTL = 3600; // 1 hour

/**
 * Initialize Redis connection
 */
export async function initializeRedis(): Promise<boolean> {
  if (redisClient?.isOpen) {
    return true;
  }

  try {
    redisClient = createClient({ url: REDIS_URL });

    redisClient.on('error', (err) => console.error('Redis error:', err));
    redisClient.on('connect', () => console.log('✓ Redis connected'));

    await redisClient.connect();
    return true;
  } catch (error) {
    console.warn('⚠️  Redis connection failed:', error instanceof Error ? error.message : 'unknown');
    redisClient = null;
    return false;
  }
}

/**
 * Get value from cache
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!redisClient?.isOpen) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Cache get error:', error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function setInCache(key: string, value: any, ttl = DEFAULT_TTL): Promise<boolean> {
  if (!redisClient?.isOpen) {
    return false;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Cache set error:', error);
    return false;
  }
}

/**
 * Delete cache key
 */
export async function deleteFromCache(key: string): Promise<boolean> {
  if (!redisClient?.isOpen) {
    return false;
  }

  try {
    const result = await redisClient.del(key);
    return result > 0;
  } catch (error) {
    console.warn('Cache delete error:', error);
    return false;
  }
}

/**
 * Clear all cache entries (use with caution)
 */
export async function clearCache(): Promise<boolean> {
  if (!redisClient?.isOpen) {
    return false;
  }

  try {
    await redisClient.flushDb();
    return true;
  } catch (error) {
    console.warn('Cache clear error:', error);
    return false;
  }
}

/**
 * Cache search results
 */
export async function cacheSearchResults(query: string, results: any, ttl = DEFAULT_TTL): Promise<boolean> {
  const key = `search:${Buffer.from(query).toString('base64')}`;
  return setInCache(key, results, ttl);
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(query: string): Promise<any | null> {
  const key = `search:${Buffer.from(query).toString('base64')}`;
  return getFromCache(key);
}

/**
 * Cache session data
 */
export async function cacheSessionData(sessionId: string, data: any, ttl = 86400): Promise<boolean> {
  // Sessions cached for 24 hours by default
  return setInCache(`session:${sessionId}`, data, ttl);
}

/**
 * Get cached session data
 */
export async function getCachedSessionData(sessionId: string): Promise<any | null> {
  return getFromCache(`session:${sessionId}`);
}

/**
 * Cache corpus statistics
 */
export async function cacheCorpusStats(stats: any, ttl = 3600): Promise<boolean> {
  // Corpus stats cached for 1 hour
  return setInCache('corpus:stats', stats, ttl);
}

/**
 * Get cached corpus statistics
 */
export async function getCachedCorpusStats(): Promise<any | null> {
  return getFromCache('corpus:stats');
}

/**
 * Invalidate all search-related caches
 */
export async function invalidateSearchCaches(): Promise<void> {
  if (!redisClient?.isOpen) return;

  try {
    const keys = await redisClient.keys('search:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    console.log(`✓ Invalidated ${keys.length} search caches`);
  } catch (error) {
    console.warn('Cache invalidation error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  connected: boolean;
  dbSize: number;
  memoryUsed: string;
}> {
  if (!redisClient?.isOpen) {
    return {
      connected: false,
      dbSize: 0,
      memoryUsed: '0B',
    };
  }

  try {
    const dbSize = await redisClient.dbSize();
    const info = await redisClient.info('memory');

    // Parse memory usage from info string
    const memMatch = info?.match(/used_memory_human:(.+)/);
    const memoryUsed = memMatch ? memMatch[1] : '0B';

    return {
      connected: true,
      dbSize,
      memoryUsed,
    };
  } catch (error) {
    console.warn('Stats error:', error);
    return {
      connected: false,
      dbSize: 0,
      memoryUsed: '0B',
    };
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    console.log('✓ Redis connection closed');
  }
}

export default {
  initializeRedis,
  getFromCache,
  setInCache,
  deleteFromCache,
  clearCache,
  cacheSearchResults,
  getCachedSearchResults,
  cacheSessionData,
  getCachedSessionData,
  cacheCorpusStats,
  getCachedCorpusStats,
  invalidateSearchCaches,
  getCacheStats,
  closeRedis,
};
