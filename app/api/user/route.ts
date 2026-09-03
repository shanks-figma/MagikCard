import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({ session, email: session?.user?.email ?? null });
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { username, bio, name, links, socialLinks } = body;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { username: true, usernameChangedAt: true },
    });

    // Username change validation
    if (username !== undefined && username !== currentUser?.username) {
      if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
        return NextResponse.json(
          { error: "Username must be 3–30 chars: lowercase letters, numbers, - or _" },
          { status: 400 }
        );
      }

      // 30-day cooldown check
      if (currentUser?.usernameChangedAt) {
        const daysSince =
          (Date.now() - new Date(currentUser.usernameChangedAt).getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysSince < 30) {
          const daysLeft = Math.ceil(30 - daysSince);
          return NextResponse.json(
            { error: `You can change your username again in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.` },
            { status: 429 }
          );
        }
      }

      // Uniqueness check
      const existing = await prisma.user.findFirst({ where: { username } });
      if (existing && existing.email !== session.user.email) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
    }

    const isUsernameChanging = username !== undefined && username !== currentUser?.username;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(username !== undefined && { username }),
        ...(isUsernameChanging && { usernameChangedAt: new Date() }),
        ...(bio !== undefined && { bio }),
        ...(name !== undefined && { name }),
        ...(links !== undefined && { links }),
        ...(socialLinks !== undefined && { socialLinks }),
      },
      select: { username: true, usernameChangedAt: true, bio: true, name: true, links: true, socialLinks: true },
    });

    return NextResponse.json(user);
  } catch (e: any) {
    console.error("[PATCH /api/user] error:", e);
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
