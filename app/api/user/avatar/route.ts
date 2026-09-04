import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Calls Vercel Blob's REST API directly (https://vercel.com/docs/vercel-blob/using-blob-sdk#uploading-a-blob)
// rather than the @vercel/blob SDK: the SDK's undici dependency uses newer JS syntax
// (private-field brand checks) that this project's old Next.js canary's webpack/SWC
// build can't parse, and fails the production build.
async function putBlob(pathname: string, file: File, token: string) {
  const res = await fetch(
    `https://blob.vercel-storage.com/${pathname}?addRandomSuffix=1`,
    {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "x-api-version": "7",
        "content-type": file.type,
      },
      body: file,
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Blob upload failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<{ url: string }>;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token)
      return NextResponse.json({ error: "Avatar storage isn't configured" }, { status: 500 });

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: "Only JPEG, PNG, WebP or GIF allowed" }, { status: 400 });

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const pathname = `avatars/${session.user.email.replace(/[^a-z0-9]/gi, "_")}.${ext}`;

    const blob = await putBlob(pathname, file, token);

    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: blob.url },
    });

    return NextResponse.json({ imageUrl: blob.url });
  } catch (e: any) {
    console.error("[POST /api/user/avatar]", e);
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}
