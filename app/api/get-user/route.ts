import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { z } from "zod";

const CACHE_TTL = 60 * 30; // 30 minutes

const userSchema = z.string();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userSchema.safeParse(userId).success) {
      const cacheKey = `user:${userId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached, { status: 200 });
      }

      const user = await prisma.userDetails.findUnique({
        where: {
          user_id: userId,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await redis.set(cacheKey, user, { ex: CACHE_TTL });
      return NextResponse.json(user, { status: 200 });
    } else {
      return NextResponse.json(
        { error: userSchema.safeParse(userId).error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
