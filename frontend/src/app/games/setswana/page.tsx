"use client";

import Link from "next/link";
import gameData from "../../../../data/setswana-game.json";
import { ArrowRight, Lightbulb, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SetswanaGameData } from "@/types/games";

const setswanaGameData = gameData as SetswanaGameData;

const hubItems = [
  {
    href: "/games/setswana/diane",
    title: "Diane",
    description: "Tlhopha tlhaloso e e nepagetseng ya seane sengwe le sengwe.",
    badge: `${setswanaGameData.categories.find((item) => item.id === "diane")?.items.length ?? 0} dipotso`,
    icon: ScrollText,
    accentClassName: "bg-[#eaf5e4] text-[#4f9a42]",
  },
  {
    href: "/games/setswana/dithamalakane",
    title: "Dithamalakane",
    description: "Buisa lelepa mme o tlhophe karabo e e nepagetseng mo dikgethong tse nne.",
    badge: `${setswanaGameData.categories.find((item) => item.id === "dithamalakane")?.items.length ?? 0} dipotso`,
    icon: Lightbulb,
    accentClassName: "bg-[#f4ead8] text-[#9a4f2b]",
  },
];

export default function SetswanaGamesPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-[#e4d7c5] bg-[#fffdf7] p-8 shadow-sm">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#9a4f2b]">Setswana Hub</p>
          <h1 className="text-3xl font-black tracking-tight text-[#17181f]">
            Diane le Dithamalakane
          </h1>
          <p className="mt-3 text-base font-semibold leading-7 text-[#6f675d]">
            Tlhopha karolo e o batlang go simolola ka yone. Fa o batla go tshameka Mohele, e fitlhele mo lenaaneng la metshameko.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {hubItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full rounded-[2rem] border-[#e4d7c5] bg-[#fffdf7] shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <div
                    className={`mb-5 inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${item.accentClassName}`}
                  >
                    {item.badge}
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-[#17181f]">{item.title}</h2>
                      <p className="mt-3 text-sm font-semibold leading-6 text-[#6f675d]">{item.description}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ead8] text-[#9a4f2b]">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm font-black text-[#4f9a42]">
                    Bula
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
