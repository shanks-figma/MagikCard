"use client";

import Image from "next/image";
import Link from "next/link";
import useScroll from "@/lib/hooks/use-scroll";
import { useSignInModal } from "./sign-in-modal";
import { Session } from "next-auth";
import UserDropdown from "./user-dropdown";

export default function NavBar({ session }: { session: Session | null }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const scrolled = useScroll(50);

  return (
    <>
      <SignInModal />
      <div
        className={`fixed top-0 flex w-full justify-center ${
          scrolled ? "border-transparent backdrop-blur-xl" : " bg-transparent"
        } z-30 transition-all`}
      >
        {/* <Banner /> */}
        <div className="mx-5 flex h-16 w-full max-w-screen-xl flex-row items-center justify-between pt-4">
          <Link href="/" className="flex items-center font-display text-2xl">
            <Image
              src="/logo.png"
              alt="logo"
              width="40"
              height="40"
              className="mr-2 rounded-sm "
            ></Image>
            <p className="text-black">OpenFlow</p>
          </Link>
          <div className="flex items-center space-x-5">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="sm:font-base inline-flex w-full items-center justify-center rounded-xl bg-[#687af0]/5 px-4 py-3 text-center text-xs font-light text-gray-100 duration-200 hover:bg-[#687af0]/5 hover:text-[#687af0] focus:outline-none focus-visible:outline-black focus-visible:ring-black sm:px-6 sm:py-3 sm:text-lg sm:font-medium lg:w-auto"
                >
                  Dashboard
                </Link>

                <UserDropdown session={session} />
              </>
            ) : (
              <>
                <button
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#687af0]/5 px-6 py-3 text-center font-medium text-black/80 duration-200 hover:bg-[#687af0]/5 hover:text-[#687af0] focus:outline-none focus-visible:outline-black focus-visible:ring-black lg:w-auto"
                  onClick={() => setShowSignInModal(true)}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
