import FlippableCard from "@/components/card";
import SignInSection from "@/components/sign-in-section";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <SignInSection />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <FlippableCard />
    </div>
  );
}
