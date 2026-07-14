"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ username: email, password });
      toast.success("Welcome back!");
      router.push("/learn");
    } catch (error) {
      const message =
        (error as { response?: { data?: { detail?: string } } } & Error).response?.data?.detail ||
        (error as Error).message ||
        "Login failed";
      toast.error(message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      toast.success("Welcome back!");
      router.push("/learn");
    } catch (error) {
      const message =
        (error as { response?: { data?: { detail?: string } } } & Error).response?.data?.detail ||
        (error as Error).message ||
        "Google sign-in failed";
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f1e4] p-4 font-sans text-[#17181f]">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-bl-[7rem] border-b border-l border-[#b86a3a]/25" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-80 border-t border-[#2f3a24]/20 bg-[#2f3a24]/5" />

      <Link href="/" className="relative mb-10 flex items-center gap-x-3 transition hover:opacity-80">
        <Image src="/zebra_logo.png" height={54} width={54} alt="Diteme logo" className="rounded-2xl border border-white/80 bg-white p-1 shadow-[0_14px_35px_rgba(80,48,28,0.12)]" />
        <div>
          <h1 className="text-4xl font-black lowercase tracking-tight text-[#17181f]">
            diteme
          </h1>
          <p className="text-sm font-semibold text-[#6b5b4e]">Learn. Speak. Belong.</p>
        </div>
      </Link>

      <div className="relative w-full max-w-md rounded-[2rem] border border-[#e3d4bf] bg-[#fffdf7] p-8 shadow-[0_24px_80px_rgba(64,44,28,0.12)]">
        <div className="text-center mb-8">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[#9a4f2b]">Welcome back</p>
          <h2 className="text-3xl font-black tracking-tight text-[#17181f]">Login</h2>
          <p className="mt-2 font-semibold text-[#6f675d]">Continue your language journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-black uppercase tracking-wide text-[#4f463f]">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border-2 border-[#e2d4c2] bg-[#f8f2e8] px-4 py-4 font-semibold text-[#17181f] placeholder:text-[#a89b8b] transition focus:border-[#9a4f2b] focus:bg-white focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-black uppercase tracking-wide text-[#4f463f]">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-black uppercase tracking-wide text-[#4f9a42] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border-2 border-[#e2d4c2] bg-[#f8f2e8] px-4 py-4 font-semibold text-[#17181f] placeholder:text-[#a89b8b] transition focus:border-[#9a4f2b] focus:bg-white focus:outline-none"
              placeholder="Enter password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="secondary"
            className="w-full h-[54px] text-lg font-bold"
          >
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e4d7c5]" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#a89b8b]">or</span>
          <div className="h-px flex-1 bg-[#e4d7c5]" />
        </div>

        <Button
          type="button"
          disabled={isLoading}
          variant="outline"
          className="w-full h-[54px] text-sm font-black text-[#2a231f]"
          onClick={handleGoogleLogin}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-3 h-5 w-5">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 11.8S6.8 21.2 12 21.2c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.2H12Z" />
            <path fill="#34A853" d="M2.6 11.8c0 1.7.4 3.3 1.2 4.7l3.9-3c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7l-3.9-3C3 8.5 2.6 10.1 2.6 11.8Z" />
            <path fill="#4A90E2" d="M12 21.2c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1l-4 3.1C4 19 7.7 21.2 12 21.2Z" />
            <path fill="#FBBC05" d="M6.4 13c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7l-4-3.1C1 8.4.5 10 .5 11.8s.5 3.4 1.9 4.8l4-3.6Z" />
          </svg>
          Continue with Google
        </Button>

        <p className="mt-8 text-center font-semibold text-[#6f675d]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-black text-[#4f9a42] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

