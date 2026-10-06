import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileView, { type User } from "./profile-view";

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await prisma.user.findFirst({ where: { username: params.username }, select: { name: true, bio: true } });
  if (!user) return {};
  return {
    title: user.name ?? `@${params.username}`,
    description: user.bio ?? `${user.name ?? params.username}'s MagikCard profile`,
  };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const [record, session] = await Promise.all([
    prisma.user.findFirst({
      where: { username: params.username },
      select: { email: true, name: true, username: true, bio: true, image: true, phone: true, links: true, socialLinks: true, cardStyle: true },
    }),
    getServerSession(authOptions),
  ]);

  if (!record) notFound();

  const isOwner = session?.user?.email === record.email;
  // Everything passed to a client component is serialized into the page HTML,
  // so only public fields may cross this line — never email or password.
  const { email: _email, ...publicFields } = record;

  return <ProfileView user={publicFields as User} isOwner={isOwner} />;
}
