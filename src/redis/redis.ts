import { createClient } from "redis"

const redisUrl = process.env.REDIS_URL!;
const useTls = process.env.REDIS_TLS === "true";

export const redisClient = createClient({
    url: redisUrl,
    ...(useTls ? { socket: { tls: true, host: new URL(redisUrl).hostname } } : {})
});

redisClient.connect();
redisClient.on("error", (err) => console.error("Redis client error: ", err));