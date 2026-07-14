"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase";

function getFirebaseResetErrorMessage(error: unknown) {
  const authError = error as { code?: string; message?: string };

  switch (authError.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-not-found":
      return "No Firebase account exists for that email.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase. Add this Vercel domain in Firebase Authentication settings.";
    case "auth/invalid-api-key":
      return "Firebase API key is invalid. Check the Vercel Firebase environment variables.";
    default:
      return authError.message || "We couldn't send the reset email right now.";
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      toast.success("If a Firebase account exists for that email, a reset link has been sent.");
    } catch (error) {
      toast.error(getFirebaseResetErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[#9a4f2b]">Account help</p>
          <h1 className="text-3xl font-black tracking-tight text-[#17181f]">Forgot Password</h1>
          <p className="mt-2 font-semibold text-[#6f675d]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-black uppercase tracking-wide text-[#4f463f]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border-2 border-[#e2d4c2] bg-[#f8f2e8] px-4 py-4 font-semibold text-[#17181f] placeholder:text-[#a89b8b] transition focus:border-[#9a4f2b] focus:bg-white focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} variant="secondary" className="h-[54px] w-full text-lg font-bold">
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-8 text-center font-semibold text-[#6f675d]">
          Remembered your password?{" "}
          <Link href="/login" className="font-black text-[#4f9a42] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

