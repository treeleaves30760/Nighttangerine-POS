"use client";

import { useOrdersStream } from "@/lib/orders-ws";
import { cn } from "@/lib/utils";

export default function NumbersOnly() {
  const { preparing, finished } = useOrdersStream();

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[radial-gradient(1200px_600px_at_-10%_-20%,rgba(255,159,67,0.12),transparent_50%),radial-gradient(900px_500px_at_110%_10%,rgba(239,68,68,0.10),transparent_50%)] dark:bg-[radial-gradient(1200px_600px_at_-10%_-20%,rgba(255,159,67,0.10),transparent_50%),radial-gradient(900px_500px_at_110%_10%,rgba(239,68,68,0.08),transparent_50%)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur shadow-xl p-6">
          <h2 className="text-4xl font-extrabold mb-4">Preparing</h2>
          {preparing.length === 0 ? (
            <p className="text-muted-foreground">No orders in preparation.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {preparing.map((o) => (
                <div
                  key={o.id}
                  className="rounded-xl overflow-hidden aspect-square flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg"
                >
                  <span className="block text-center font-extrabold leading-none tracking-tight text-[clamp(2.5rem,7vw,4.5rem)] drop-shadow">
                    {o.number}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur shadow-xl p-6">
          <h2 className="text-4xl font-extrabold mb-4">Ready for Pickup</h2>
          {finished.length === 0 ? (
            <p className="text-muted-foreground">No finished orders yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {finished.map((o) => (
                <div
                  key={o.id}
                  className={cn(
                    "rounded-xl overflow-hidden aspect-square flex items-center justify-center text-white",
                    "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg"
                  )}
                >
                  <span className="block text-center font-extrabold leading-none tracking-tight text-[clamp(2.5rem,7vw,4.5rem)] drop-shadow">
                    {o.number}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

