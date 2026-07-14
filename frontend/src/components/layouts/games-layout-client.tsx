"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";

type Props = Readonly<{
  children: React.ReactNode;
}>;

export function GamesLayoutClient({ children }: Props) {
  const router = useRouter();
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchUser();
    }
  }, [fetchUser, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fbf7ef] text-[#17181f]">
      <header className="border-b border-[#e4d7c5] bg-[#fffdf7]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <Link href="/learn" className="flex items-center gap-3">
            <Image src="/zebra_logo.png" alt="Diteme" width={42} height={42} className="rounded-xl border border-[#eadbc7] bg-white p-1 shadow-sm" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a4f2b]">Diteme</p>
              <h1 className="text-xl font-black tracking-tight text-[#17181f]">Games</h1>
            </div>
          </Link>
          <Button asChild variant="outline">
            <Link href="/learn">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Learning
            </Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-[1180px] px-6 py-8">{children}</main>
    </div>
  );
}

