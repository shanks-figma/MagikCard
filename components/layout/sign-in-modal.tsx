import Modal from "@/components/shared/modal";
import { signIn } from "next-auth/react";
import {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { LoadingDots } from "@/components/shared/icons";
import Google from "@/components/shared/icons/google";
import Image from "next/image";

const SignInModal = ({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    if (isSignUp) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      setShowSignInModal(false);
      window.location.reload();
    }
  };

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full overflow-hidden shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-6 pt-8 text-center md:px-16">
          <a href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full"
              width={20}
              height={20}
            />
          </a>
          <h3 className="font-display text-2xl font-bold">
            {isSignUp ? "Create Account" : "Sign In"}
          </h3>
          <p className="text-sm text-gray-700">Let&apos;s get you started!</p>
        </div>
        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 md:px-16">
          {/* Google OAuth button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none"
          >
            <Google className="h-5 w-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {isSignUp && (
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`${
              loading
                ? "cursor-not-allowed border-gray-200 bg-gray-100"
                : "border border-gray-200 bg-black text-white hover:bg-gray-800"
            } flex h-10 w-full items-center justify-center rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
          >
            {loading ? (
              <LoadingDots color="#808080" />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
          <p className="text-center text-sm text-gray-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="font-medium text-black underline"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    );
  }, [showSignInModal, setShowSignInModal]);

  return useMemo(
    () => ({ setShowSignInModal, SignInModal: SignInModalCallback }),
    [setShowSignInModal, SignInModalCallback]
  );
}
