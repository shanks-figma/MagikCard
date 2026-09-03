import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: "Only JPEG, PNG, WebP or GIF allowed" }, { status: 400 });

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `${session.user.email.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
    const savePath = path.join(process.cwd(), "public", "avatars", filename);

    const bytes = await file.arrayBuffer();
    await writeFile(savePath, Buffer.from(bytes));

    const imageUrl = `/avatars/${filename}`;

    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (e: any) {
    console.error("[POST /api/user/avatar]", e);
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}
