import Redis from 'ioredis';

const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    // During build time, return a stub client
    return new Redis({ lazyConnect: true, enableOfflineQueue: false });
  }

  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
};

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? getRedisClient();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
