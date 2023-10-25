import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!upstashRedisRestUrl || !upstashRedisRestToken) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in .env");
}

export const db = new Redis({
    url: upstashRedisRestUrl,
    token: upstashRedisRestToken,
});
