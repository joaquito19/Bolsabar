import Redis from "ioredis";
const url = process.env.REDIS_URL;
if (!url) console.warn("REDIS_URL not set. Redis features will be no-op locally.");
export const redis = url ? new Redis(url) : ({
  async get(){ return null as any; },
  async set(){ return; },
  async setex(){ return; },
  async del(){ return; },
  async incrbyfloat(){ return; },
}) as unknown as Redis;
