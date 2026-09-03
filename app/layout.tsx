import "./globals.css";
import cx from "classnames";
import { sfPro, inter, onest } from "./fonts";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import AuthProvider from "@/components/contexts/auth-provider";
import NavBar from "@/components/layout/navbar";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "",
  description: "",
  metadataBase: new URL("https://magikcard.com"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  console.log(session);

  return (
    <AuthProvider>
      <html lang="en">
        <body className={cx(sfPro.variable, inter.variable, onest.variable)}>
          {/* <div className="fixed h-screen w-full" /> */}
          {/* <Suspense fallback="...">
            <NavBar session={session} />
          </Suspense> */}
          <main className="flex min-h-screen w-full flex-col">
            {children}
          </main>
          {/* <Footer /> */}
          <VercelAnalytics />
        </body>
      </html>
    </AuthProvider>
  );
}
