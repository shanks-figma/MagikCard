import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function Page({ params }: { params: { user_id: string } }) {
  const { user_id } = params;

  const card = await prisma.card.findUnique({ where: { username: user_id } });
  redirect(card?.redirect_url ?? "/");
}
