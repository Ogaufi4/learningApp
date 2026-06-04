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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] p-4 font-sans">
      <Link href="/" className="flex items-center gap-x-3 mb-12 hover:opacity-80 transition group">
        <Image src="/zebra_logo.png" height={50} width={50} alt="Logo" className="rounded-xl shadow-lg border-2 border-white group-hover:scale-110 transition duration-300" />
        <h1 className="text-4xl font-extrabold text-[#58cc02] tracking-tighter">
          Diteme
        </h1>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-800 tracking-tight">Login</h2>
          <p className="text-neutral-500 mt-2 font-medium">Continue your language journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-neutral-600 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#58cc02] transition font-medium"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-bold text-neutral-600 uppercase tracking-wide">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-bold uppercase tracking-wide text-[#58cc02] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#58cc02] transition font-medium"
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
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Button
          type="button"
          disabled={isLoading}
          variant="outline"
          className="w-full h-[54px] text-sm font-bold text-slate-700"
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

        <p className="mt-8 text-center text-neutral-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#58cc02] font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

