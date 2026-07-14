import { NotebookText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type UnitBannerProps = {
  title: string;
  description: string;
  locked?: boolean;
};

export const UnitBanner = ({ title, description, locked }: UnitBannerProps) => {
  return (
    <div className={`flex w-full items-center justify-between rounded-[1.5rem] border p-5 shadow-sm ${locked ? "border-[#d8ccbc] bg-[#e9e2d6] text-[#7c7062]" : "border-[#d9c3a8] bg-[#fffdf7] text-[#17181f]"}`}>
      <div className="space-y-2.5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a4f2b]">Course unit</p>
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="text-base font-semibold text-[#6f675d]">{description}</p>
      </div>

      {!locked && (
        <Link href="/lesson">
          <Button
            size="lg"
            variant="secondary"
            className="hidden border-2 border-b-4 active:border-b-2 xl:flex"
          >
            <NotebookText className="mr-2" />
            Continue
          </Button>
        </Link>
      )}
    </div>
  );
};
