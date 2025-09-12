
import { Logo } from "@/components/shared/logo"

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo />
          <p className="text-center text-sm leading-loose md:text-left">
            © {new Date().getFullYear()} Nighttangerine, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
