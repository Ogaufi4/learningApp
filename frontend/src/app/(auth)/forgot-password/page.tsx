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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] p-4 font-sans">
      <Link href="/" className="mb-12 flex items-center gap-x-3 transition hover:opacity-80 group">
        <Image
          src="/zebra_logo.png"
          height={50}
          width={50}
          alt="Logo"
          className="rounded-xl border-2 border-white shadow-lg transition duration-300 group-hover:scale-110"
        />
        <h1 className="text-4xl font-extrabold tracking-tighter text-[#58cc02]">Diteme</h1>
      </Link>

      <div className="w-full max-w-md rounded-3xl border-2 border-slate-200 bg-white p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-800">Forgot Password</h1>
          <p className="mt-2 font-medium text-neutral-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold uppercase tracking-wide text-neutral-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-100 px-4 py-4 font-medium transition focus:border-[#58cc02] focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} variant="secondary" className="h-[54px] w-full text-lg font-bold">
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-8 text-center font-medium text-neutral-500">
          Remembered your password?{" "}
          <Link href="/login" className="font-bold text-[#58cc02] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

