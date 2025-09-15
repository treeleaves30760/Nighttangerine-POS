"use client";

import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ordersApi, type Order, type OrderStatus } from "@/lib/orders";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { OrdersAnalysis } from "@/components/shared/orders-analysis";

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [active, finished] = await Promise.all([
          ordersApi.getActive(true),
          ordersApi.getFinished(true),
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

  const handleExport = () => {
    const csv = [
      ["id", "number", "status", "createdAt", "items"].join(","),
      ...orders.map(o => [o.id, o.number, o.status, o.createdAt, `"${JSON.stringify(o.items).replace(/"/g, '""')}"`].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "orders.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      const importedOrders: Order[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line manually to handle quoted JSON properly
        const values: string[] = [];
        let current = "";
        let inQuotes = false;
        let j = 0;

        while (j < line.length) {
          const char = line[j];
          const nextChar = line[j + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote inside quoted field
              current += '"';
              j += 2;
            } else {
              // Start or end of quoted field
              inQuotes = !inQuotes;
              j++;
            }
          } else if (char === ',' && !inQuotes) {
            // Field separator
            values.push(current);
            current = "";
            j++;
          } else {
            current += char;
            j++;
          }
        }

        // Add the last field
        values.push(current);

        if (values.length < 5) continue;

        const [id, number, status, createdAt, items] = values;

        try {
          importedOrders.push({
            id,
            number: parseInt(number),
            status: status as OrderStatus,
            createdAt: new Date(createdAt).toISOString(),
            items: JSON.parse(items),
          });
        } catch (error) {
          console.error("Error parsing line:", line, error);
        }
      }

      console.log("Parsed orders from CSV:", importedOrders.length);
      console.log("Sample order:", importedOrders[0]);

      try {
        // Use the bulk import API to save to database
        const savedOrders = await ordersApi.bulkImport(importedOrders);
        console.log("API response - saved orders:", savedOrders.length);

        // Refresh the orders list to show the imported data from database
        const [active, finished] = await Promise.all([
          ordersApi.getActive(true),
          ordersApi.getFinished(true),
        ]);
        const merged = [...active, ...finished].sort((a, b) => b.number - a.number);
        setOrders(merged);

        console.log(`Successfully imported ${savedOrders.length} orders`);
      } catch (error) {
        console.error("Error importing orders:", error);
        // Fallback to local state update if API fails
        setOrders(prev => [...prev, ...importedOrders].sort((a, b) => b.number - a.number));
      }
    };
    reader.readAsText(file);
  };

  return (
    <Section className="text-[18px] md:text-[20px]">
      <OrdersAnalysis orders={orders} />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">Orders List</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="text-base md:text-lg">Export</Button>
              <Button variant="outline" onClick={() => document.getElementById('import-input')?.click()} className="text-base md:text-lg">Import</Button>
              <input type="file" id="import-input" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found.</p>
          ) : (
            <Table className="text-xl">
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
                    <TableCell className="font-semibold">{o.number}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-lg capitalize bg-muted/40">
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="text-right">{o.items?.reduce((c, it) => c + it.quantity, 0) ?? 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals[o.id] || 0)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {o.status !== "finished" && (
                          <Button variant="secondary" size="sm" onClick={() => markFinished(o.id)} className="text-base md:text-lg">Mark Finished</Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => removeOrder(o.id)} className="text-base md:text-lg">Delete</Button>
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
