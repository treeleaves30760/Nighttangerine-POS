import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
	children: React.ReactNode;
	innerClassName?: string;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
	({ children, className, innerClassName, ...props }, ref) => {
		return (
			<section ref={ref} className={cn(className)} {...props}>
				<div
					className={cn("mx-auto py-16 px-4 md:px-6 h-full", innerClassName)}
				>
					{children}
				</div>
			</section>
		);
	}
);

Section.displayName = "Section";
