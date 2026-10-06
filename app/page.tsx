import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Landing from "@/components/landing";
export const metadata = {
  title: "MagikCard — The last business card you'll ever need",
  description: "Turn your photo, links and contact details into one beautiful page. Share it with a link or QR code, and let people save you to their phone in one tap. Free to create.",
};
export default async function Home() {
  const session = await getServerSession(authOptions);
  return <Landing signedIn={!!session?.user?.email} />;
}
