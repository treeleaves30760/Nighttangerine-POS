
import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(({ children, className, ...props }, ref) => {
  return (
    <section ref={ref} className={cn("py-16 md:py-24", className)} {...props}>
      <div className="container">
        {children}
      </div>
    </section>
  )
});

Section.displayName = "Section";
