import { InfinityIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatAssetUrl } from "@/lib/utils";

type UserProgressProps = {
  activeCourse: {
    title: string;
    imageSrc: string;
  };
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const UserProgress = ({
  activeCourse,
  hearts,
  points,
  hasActiveSubscription,
}: UserProgressProps) => {
  return (
    <div className="flex w-full items-center justify-between gap-x-2 rounded-[1.5rem] border border-[#e4d7c5] bg-[#fffdf7] p-3 shadow-sm">
      <Link href="/courses">
        <Button variant="ghost">
          <div className="relative aspect-[4/3] w-10 overflow-hidden rounded-xl border border-[#dfc3a9]">
            <Image
              src={formatAssetUrl(activeCourse.imageSrc) || "/es.svg"}
              alt={activeCourse.title}
              fill
              className="object-cover"
            />
          </div>
        </Button>
      </Link>

      <Button variant="ghost" className="cursor-default text-[#9a4f2b] hover:bg-transparent">
        <Image
          src="/points.svg"
          height={28}
          width={28}
          alt="Points"
          className="mr-2"
        />
        {points}
      </Button>

      <Button variant="ghost" className="cursor-default text-[#4f9a42] hover:bg-transparent">
        <Image
          src="/heart.svg"
          height={22}
          width={22}
          alt="Hearts"
          className="mr-2"
        />
        {hasActiveSubscription ? (
          <InfinityIcon className="stroke-3 h-4 w-4" />
        ) : (
          hearts
        )}
      </Button>
    </div>
  );
};
