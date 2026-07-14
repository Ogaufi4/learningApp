"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { passwordRuleText, validatePassword } from "@/lib/auth/password";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      await register({ email, password, full_name: fullName });
      toast.success("Account created! Welcome to Diteme!");
      router.push("/learn");
    } catch (error) {
      const message =
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
        "Registration failed";
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f1e4] p-4 font-sans text-[#17181f]">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-bl-[7rem] border-b border-l border-[#b86a3a]/25" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-80 border-t border-[#2f3a24]/20 bg-[#2f3a24]/5" />

      <Link href="/" className="relative mb-10 flex items-center gap-x-3 transition hover:opacity-80">
        <Image
          src="/zebra_logo.png"
          height={54}
          width={54}
          alt="Diteme logo"
          className="rounded-2xl border border-white/80 bg-white p-1 shadow-[0_14px_35px_rgba(80,48,28,0.12)]"
        />
        <div>
          <h1 className="text-4xl font-black lowercase tracking-tight text-[#17181f]">diteme</h1>
          <p className="text-sm font-semibold text-[#6b5b4e]">Learn. Speak. Belong.</p>
        </div>
      </Link>

      <div className="relative w-full max-w-md rounded-[2rem] border border-[#e3d4bf] bg-[#fffdf7] p-8 shadow-[0_24px_80px_rgba(64,44,28,0.12)]">
        <div className="text-center mb-8">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[#9a4f2b]">Join Diteme</p>
          <h1 className="text-3xl font-black tracking-tight text-[#17181f]">Create Account</h1>
          <p className="mt-2 font-semibold text-[#6f675d]">
            Start your Setswana learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-black uppercase tracking-wide text-[#4f463f]">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl border-2 border-[#e2d4c2] bg-[#f8f2e8] px-4 py-4 font-semibold text-[#17181f] placeholder:text-[#a89b8b] transition focus:border-[#9a4f2b] focus:bg-white focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-black uppercase tracking-wide text-[#4f463f]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border-2 border-[#e2d4c2] bg-[#f8f2e8] px-4 py-4 font-semibold text-[#17181f] placeholder:text-[#a89b8b] transition focus:border-[#9a4f2b] focus:bg-white focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-black uppercase tracking-wide text-[#4f463f]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-2xl border-2 border-[#e2d4c2] bg-[#f8f2e8] px-4 py-4 font-semibold text-[#17181f] placeholder:text-[#a89b8b] transition focus:border-[#9a4f2b] focus:bg-white focus:outline-none"
              placeholder="Create a password"
            />
            <p className="text-xs font-semibold text-[#7f7569]">{passwordRuleText}</p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="secondary"
            className="w-full h-[54px] text-lg font-bold"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center font-semibold text-[#6f675d]">
          Already have an account?{" "}
          <Link href="/login" className="font-black text-[#4f9a42] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

