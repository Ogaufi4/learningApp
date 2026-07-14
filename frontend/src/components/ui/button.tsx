import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-extrabold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a4f2b] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-white text-[#2a231f] border-[#e4d7c5] border-2 border-b-4 active:border-b-2 hover:bg-[#fbf6ec]",

        // custom
        locked:
          "bg-[#e9e2d6] text-[#7c7062] hover:bg-[#e9e2d6]/90 border-[#d6c8b6] border-b-4 active:border-b-0",

        primary:
          "bg-[#9a4f2b] text-white hover:bg-[#884424] border-[#74361f] border-b-4 active:border-b-0",
        primaryOutline: "bg-white text-[#9a4f2b] hover:bg-[#fbf6ec] border-[#d6b99f] border-2",

        secondary:
          "bg-[#5fb84f] text-white hover:bg-[#55a846] border-[#438936] border-b-4 active:border-b-0 shadow-sm shadow-[#5fb84f]/20",
        secondaryOutline: "bg-white text-[#4f9a42] hover:bg-[#f2faee] border-[#bcdcb0] border-2",

        danger:
          "bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0",
        dangerOutline: "bg-white text-rose-600 hover:bg-rose-50 border-rose-200 border-2",

        super:
          "bg-[#2f3a24] text-white hover:bg-[#26301e] border-[#1d2417] border-b-4 active:border-b-0",
        superOutline: "bg-white text-[#2f3a24] hover:bg-[#f4f6ef] border-[#b8c4a8] border-2",

        ghost:
          "bg-transparent text-[#6f675d] border-transparent border-0 hover:bg-[#f2eadc] hover:text-[#2a231f]",

        sidebar:
          "bg-transparent text-[#6f675d] border-2 border-transparent hover:bg-[#f7f1e4] hover:text-[#2a231f] transition-none",
        sidebarOutline:
          "bg-[#f7f1e4] text-[#9a4f2b] border-[#dfc3a9] border-2 hover:bg-[#f2e7d6] transition-none",
        outline:
          "bg-white border-[#e4d7c5] border-2 hover:bg-[#fbf6ec] text-[#4f463f]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",

        // custom
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
