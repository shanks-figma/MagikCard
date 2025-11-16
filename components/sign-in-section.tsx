"use client";

import { useSignInModal } from "@/components/layout/sign-in-modal";
import { content } from "constants/constant";

export default function SignInSection() {
  const { SignInModal, setShowSignInModal } = useSignInModal();

  return (
    <>
      <SignInModal />
      <div className="flex flex-col items-center justify-center h-screen w-full gap-4">
        <p>Please sign in to continue</p>
        <button
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#687af0]/5 px-6 py-3 text-center font-medium text-black/80 duration-200 hover:bg-[#687af0]/5 hover:text-[#687af0] focus:outline-none focus-visible:outline-black focus-visible:ring-black lg:w-auto"
          onClick={() => setShowSignInModal(true)}
        >
          {content.signin.title}
        </button>
      </div>
    </>
  );
}
