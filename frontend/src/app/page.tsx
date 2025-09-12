
"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/section";

// This can be expanded into a full dashboard with navigation, etc.
function Dashboard() {
  const { user } = useUser();

  return (
    <Section>
      <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mt-2">This is your POS dashboard. Ready to make a sale?</p>
      
      <div className="mt-8 p-8 bg-card rounded-lg border">
        <h2 className="text-xl font-semibold">Point of Sale Terminal</h2>
        <div className="mt-4 h-64 flex items-center justify-center bg-background rounded-md">
            <p className="text-muted-foreground">[Sales Register Interface Will Go Here]</p>
        </div>
      </div>
    </Section>
  );
}

function LoginPage() {
  return (
    <Section className="text-center py-32">
      <h1 className="text-4xl font-bold tracking-tighter mb-4">Nighttangerine POS</h1>
      <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-8">
        The intuitive Point-of-Sale for small businesses. Please sign in to continue.
      </p>
      <Button asChild size="lg">
        <a href="/api/auth/login">Sign In</a>
      </Button>
    </Section>
  );
}

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <Section className="text-center py-32">
        <p>Loading...</p>
      </Section>
    );
  }

  return user ? <Dashboard /> : <LoginPage />;
}
