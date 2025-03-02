import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function Page({
  params,
}: {
  params: { user_id: string };
}) {
  const { user_id } = params;
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) {
    // redirect("/");
    console.log("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: user_id,
    },
  });

  if (!user) {
    console.log("User not found");
  }

  return <div>Page {user_id}</div>;
}
