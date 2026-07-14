"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, Grid2x2, Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const games = [
  {
    href: "/games/setswana",
    title: "Dithamalakane le Diane",
    description:
      "Araba dipotso tsa Setswana ka dithamalakane le diane. Tlhopha karolo, latela score, mme o boele gape.",
    badge: "Quiz Game",
    icon: BookOpenText,
    accentClassName: "bg-[#f4ead8] text-[#9a4f2b]",
  },
  {
    href: "/games/morris",
    title: "Mohele",
    description:
      "Motshameko wa board wa setso o o ka o tshamekang mo sesebedisweng se le sengwe kgotsa le tsala mo room.",
    badge: "Board Game",
    icon: Swords,
    accentClassName: "bg-[#eaf5e4] text-[#4f9a42]",
  },
];

export default function GamesPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-[#e4d7c5] bg-[#fffdf7] p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#eadbc7] bg-white shadow-sm">
              <Image src="/logo.png" alt="Diteme logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a4f2b]">Diteme Games</p>
              <p className="text-sm font-semibold text-[#6f675d]">Learning meets play</p>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#17181f]">
            Tlhopha motshameko o o batlang go o tshameka
          </h1>
          <p className="mt-3 text-base font-semibold leading-7 text-[#6f675d]">
            `/games` jaanong ke lefelo la gago la motshameko mo Diteme. Re ka oketsa le mengwe motlhofo mo nakong e e tlang.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Link key={game.href} href={game.href}>
              <Card className="h-full rounded-[2rem] border-[#e4d7c5] bg-[#fffdf7] shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <div
                    className={`mb-5 inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${game.accentClassName}`}
                  >
                    {game.badge}
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-[#17181f]">{game.title}</h2>
                      <p className="mt-3 text-sm font-semibold leading-6 text-[#6f675d]">{game.description}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead8] text-[#9a4f2b]">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm font-black text-[#4f9a42]">
                    Bula motshameko
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-[#e4d7c5] bg-[#fffdf7] p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Grid2x2 className="h-5 w-5 text-[#9a4f2b]" />
          <h2 className="text-lg font-black text-[#17181f]">Go oketsa metshameko e mengwe</h2>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#6f675d]">
          O ka tsenya game e ntšha e le route e ntšha ka fa tlase ga `/games/` mme o e tsenye mo lenaaneng le le fa godimo.
        </p>
      </div>
    </div>
  );
}

