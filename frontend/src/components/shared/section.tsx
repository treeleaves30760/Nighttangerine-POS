import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
	children: React.ReactNode;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
	({ children, className, ...props }, ref) => {
		return (
			<section ref={ref} className={cn(className)} {...props}>
				<div className="mx-auto py-16 px-4 md:px-6 h-full">{children}</div>
			</section>
		);
	}
);

Section.displayName = "Section";
