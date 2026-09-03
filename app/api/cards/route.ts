import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, username, redirect_url, card_front_url, card_back_url } = await req.json();

    if (!name || !username) {
      return NextResponse.json({ error: "Name and username are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.card.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const card = await prisma.card.create({
      data: { name, username, redirect_url, card_front_url, card_back_url, userId: user.id },
    });

    // Auto-set profile username from first card if not already set
    if (!user.username) {
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    }

    return NextResponse.json(card, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
