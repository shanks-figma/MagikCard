import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import EditClient from "./edit-client";

export default async function EditProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  const user = await prisma.user.findFirst({ where: { username: params.username } });
  if (!user) notFound();

  // Only the owner can edit
  if (user.email !== session.user.email) redirect(`/p/${params.username}`);

  return (
    <EditClient
      username={user.username ?? ""}
      usernameChangedAt={user.usernameChangedAt?.toISOString() ?? null}
      initialName={user.name ?? ""}
      initialBio={user.bio ?? ""}
      initialImage={user.image ?? null}
      initialLinks={(user.links as { heading: string; url: string }[]) ?? []}
      initialSocialLinks={(user.socialLinks as Record<string, string>) ?? {}}
    />
  );
}
