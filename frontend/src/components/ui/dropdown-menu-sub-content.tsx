"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenuSubContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.SubContent
		ref={ref}
		className={cn(
			"z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
			className
		)}
		{...props}
	/>
));
DropdownMenuSubContent.displayName =
	DropdownMenuPrimitive.SubContent.displayName;

export { DropdownMenuSubContent };