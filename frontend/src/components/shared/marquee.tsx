"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  speed?: number; // pixels per second
  className?: string; // container
  textClassName?: string; // text element
};

export function Marquee({ text, speed = 180, className, textClassName }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [x, setX] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const span = textRef.current;
    if (!container || !span) return;

    let frame: number;
    let last = performance.now();

    const measure = () => ({
      containerW: container.clientWidth,
      textW: span.scrollWidth,
    });

    let { containerW, textW } = measure();
    // Start just outside the right edge if needed
    let pos = Math.max(x || containerW, containerW);

    const onResize = () => {
      const m = measure();
      containerW = m.containerW;
      textW = m.textW;
      if (pos > containerW) pos = containerW; // keep within reasonable range
    };

    const tick = (now: number) => {
      const dt = (now - last) / 1000; // seconds
      last = now;
      pos -= speed * dt;
      // If completely left of the container, reset to right edge immediately
      if (pos + textW <= 0) {
        pos = containerW;
      }
      setX(pos);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [text, speed]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      <span
        ref={textRef}
        className={cn("whitespace-nowrap will-change-transform block", textClassName)}
        style={{ transform: `translateX(${x}px)` }}
      >
        {text}
      </span>
    </div>
  );
}

