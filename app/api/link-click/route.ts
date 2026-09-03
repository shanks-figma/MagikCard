import redis from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: record a click on a link (public, no auth needed)
export async function POST(req: Request) {
  try {
    const { username, linkUrl } = await req.json().catch(() => ({}));
    if (!username || !linkUrl) return NextResponse.json({ ok: false }, { status: 400 });
    await redis.hincrby(`link_clicks:${username}`, linkUrl, 1);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET: fetch all click counts for a user (owner only)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) return NextResponse.json({}, { status: 400 });

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({}, { status: 401 });

    // Verify ownership
    const user = await prisma.user.findFirst({
      where: { username, email: session.user.email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({}, { status: 403 });

    const clicks = (await redis.hgetall(`link_clicks:${username}`)) ?? {};
    return NextResponse.json(clicks);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
