"use client";

import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ordersApi, type Order } from "@/lib/orders";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [active, finished] = await Promise.all([
          ordersApi.getActive(),
          ordersApi.getFinished(),
        ]);
        if (!mounted) return;
        const merged = [...active, ...finished].sort((a, b) => b.number - a.number);
        setOrders(merged);
      } catch {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, o) => {
      const sum = (o.items || []).reduce((s, it) => s + it.price * it.quantity, 0);
      acc[o.id] = sum;
      return acc;
    }, {});
  }, [orders]);

  const markFinished = async (id: string) => {
    try {
      const updated = await ordersApi.markFinished(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch {
      // noop
    }
  };

  const removeOrder = async (id: string) => {
    try {
      await ordersApi.remove(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      // noop
    }
  };

  return (
    <Section>
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">#</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[220px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} className={cn(o.status === "finished" && "opacity-80")}> 
                    <TableCell className="font-medium">{o.number}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs capitalize bg-muted/40">
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="text-right">{o.items?.reduce((c, it) => c + it.quantity, 0) ?? 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals[o.id] || 0)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {o.status !== "finished" && (
                          <Button variant="secondary" size="sm" onClick={() => markFinished(o.id)}>Mark Finished</Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => removeOrder(o.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}

