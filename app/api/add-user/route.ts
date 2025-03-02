import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  redirect_url: z.string().url().optional(),
  user_id: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, redirect_url, user_id } = userSchema.parse(body);
    if (userSchema.safeParse(body).success) {
      const user = await prisma.userDetails.create({
        data: {
          email,
          redirect_url,
          user_id,
        },
      });

      return NextResponse.json(user, { status: 201 });
    } else {
      return NextResponse.json(
        { error: userSchema.safeParse(body).error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}
