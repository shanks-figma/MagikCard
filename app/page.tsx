import FlippableCard from "@/components/card";
import SignInSection from "@/components/sign-in-section";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <SignInSection />;
  }

  redirect("/dashboard");
}
