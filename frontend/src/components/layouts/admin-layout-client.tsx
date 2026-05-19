"use client";

import { usePathname } from "next/navigation";
import { AdminProvider } from "@/components/providers/admin-provider";
import { AdminSidebar } from "@/components/admin-sidebar";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

export function AdminLayoutClient({ children }: Props) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminProvider>
      {!isLoginPage && <AdminSidebar className="hidden lg:flex" />}
      <main className={cn("h-full", !isLoginPage && "lg:pl-[256px]")}>
        <div className={cn("h-full", !isLoginPage && "mx-auto max-w-[1056px] pt-6")}>{children}</div>
      </main>
    </AdminProvider>
  );
}
