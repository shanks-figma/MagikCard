import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileView from "./profile-view";

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await prisma.user.findFirst({ where: { username: params.username } });
  if (!user) return {};
  return {
    title: user.name ?? `@${params.username}`,
    description: user.bio ?? `${user.name ?? params.username}'s MagikCard profile`,
  };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const [user, session] = await Promise.all([
    prisma.user.findFirst({ where: { username: params.username } }),
    getServerSession(authOptions),
  ]);

  if (!user) notFound();

  const isOwner = session?.user?.email === user.email;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProfileView user={user as any} isOwner={isOwner} />;
}
