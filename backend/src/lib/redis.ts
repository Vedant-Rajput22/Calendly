import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

export const redisClient = redisUrl ? new Redis(redisUrl) : null;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisClient) return null;
  const value = await redisClient.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function setCache(key: string, value: unknown, ttlSeconds: number) {
  if (!redisClient) return;
  await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function delCache(key: string) {
  if (!redisClient) return;
  await redisClient.del(key);
}
