"use client";

import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { Button } from "./ui/button";

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  const { user, logout } = useAuthStore();

  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r border-[#e4d7c5] bg-[#fffdf7] px-4 shadow-[12px_0_40px_rgba(64,44,28,0.05)] lg:fixed lg:w-[256px]",
        className
      )}
    >
      <Link href="/learn">
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image src="/zebra_logo.png" alt="Mascot" height={42} width={42} className="rounded-xl border border-[#eadbc7] bg-white p-1 shadow-sm" />

          <h1 className="text-2xl font-black lowercase tracking-tight text-[#17181f]">
            diteme
          </h1>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem label="Learn" href="/learn" iconSrc="/learn.svg" />
        <SidebarItem label="Games" href="/games" iconSrc="/games.svg" />
        <SidebarItem
          label="Leaderboard"
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        />
        <SidebarItem label="Profile" href="/profile" iconSrc="/boy.svg" />
      </div>

      <div className="p-4">
        {user ? (
          <div className="flex items-center gap-x-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#4f463f]">{user.full_name || user.email}</p>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

