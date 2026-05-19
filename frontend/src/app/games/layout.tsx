import type { Metadata } from "next";
import { GamesLayoutClient } from "@/components/layouts/games-layout-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function GamesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GamesLayoutClient>{children}</GamesLayoutClient>;
}
