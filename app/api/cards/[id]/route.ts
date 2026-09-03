import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getAuthorizedCard(id: string, email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card || card.userId !== user.id) return null;
  return { card, user };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getAuthorizedCard(params.id, session.user.email);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { card, user } = result;

    const { name, username, redirect_url, card_front_url, card_back_url } = await req.json();

    // Check username uniqueness if changing
    if (username && username !== card.username) {
      const existing = await prisma.card.findUnique({ where: { username } });
      if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const updated = await prisma.card.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(redirect_url !== undefined && { redirect_url }),
        ...(card_front_url !== undefined && { card_front_url }),
        ...(card_back_url !== undefined && { card_back_url }),
      },
    });

    // Keep User.username in sync if this card's username was the source
    if (username && user.username === card.username) {
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getAuthorizedCard(params.id, session.user.email);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.card.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
