import { redirect } from "next/navigation";
import redis from "@/lib/redis";
import prisma from "@/lib/prisma";

const CACHE_TTL = 60 * 30; // 30 minutes

export default async function Page({
  params,
}: {
  params: { user_id: string };
}) {
  const { user_id } = params;

  const cacheKey = `user:${user_id}`;
  let redirectUrl: string | undefined;

  const cached = await redis.get<{ redirect_url?: string }>(cacheKey);
  if (cached) {
    redirectUrl = cached.redirect_url;
  } else {
    const user = await prisma.userDetails.findUnique({
      where: { user_id },
    });
    if (user) {
      await redis.set(cacheKey, user, { ex: CACHE_TTL });
      redirectUrl = user.redirect_url ?? undefined;
    }
  }

  redirect(redirectUrl ?? "/");
}
