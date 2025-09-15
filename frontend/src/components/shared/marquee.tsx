"use client";

import FastMarquee from "react-fast-marquee";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  speed?: number; // pixels per second
  className?: string; // container
  textClassName?: string; // text element
};

export function Marquee({ text, speed = 180, className, textClassName }: Props) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <FastMarquee
        speed={speed}
        gradient={false}
        pauseOnHover={false}
        pauseOnClick={false}
      >
        <span className={cn("whitespace-nowrap", textClassName)}>
          {text}
        </span>
      </FastMarquee>
    </div>
  );
}

