import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user_id, redirect_url, card_front_url, card_back_url } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check username is not taken by someone else
    if (user_id) {
      const existing = await prisma.userDetails.findUnique({ where: { user_id } });
      if (existing && existing.userId !== user.id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
    }

    const userDetails = await prisma.userDetails.upsert({
      where: { email: session.user.email },
      update: {
        ...(user_id && { user_id }),
        ...(redirect_url !== undefined && { redirect_url }),
        ...(card_front_url !== undefined && { card_front_url }),
        ...(card_back_url !== undefined && { card_back_url }),
      },
      create: {
        email: session.user.email,
        user_id: user_id || session.user.email.split("@")[0],
        redirect_url: redirect_url || null,
        card_front_url: card_front_url || null,
        card_back_url: card_back_url || null,
        userId: user.id,
      },
    });

    return NextResponse.json(userDetails);
  } catch (err) {
    console.error("Update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
