"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { user, error, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="font-bold">Nighttangerine POS</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          {isLoading && <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />} 
          {!isLoading && !user && (
            <Button asChild>
              <a href="/api/auth/login">Sign In</a>
            </Button>
          )}
          {!isLoading && user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.name}</span>
              <a href="/api/auth/logout">
                <Avatar>
                  {user.picture && <AvatarImage src={user.picture} alt={user.name || 'user avatar'} />}
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}