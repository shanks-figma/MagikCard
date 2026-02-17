import { env } from "@/app/env";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://mature-reptile-16121.upstash.io",
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
