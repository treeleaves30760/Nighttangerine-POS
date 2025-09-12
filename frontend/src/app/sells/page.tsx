"use client";

import { useEffect, useMemo, useState } from "react";
import { productsApi, type Product } from "@/lib/api";
import { ordersApi, type CreateOrderItem, type Order, type OrderSummary } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/shared/section";
import { cn, formatCurrency } from "@/lib/utils";

type CartItem = {
  product: Product;
  quantity: number;
};

export default function SellsPage() {
  const [menu, setMenu] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [placing, setPlacing] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    productsApi.getAvailable().then(setMenu).catch(() => setMenu([]));
    // Load both active and finished so finished remain visible until removed
    Promise.all([ordersApi.getActive(), ordersApi.getFinished()])
      .then(([active, finished]) => {
        const merged = [...finished, ...active].sort((a, b) => b.number - a.number);
        setActiveOrders(merged);
      })
      .catch(() => setActiveOrders([]));
  }, []);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i)));
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id));

  const total = useMemo(() => cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [cart]);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const items: CreateOrderItem[] = cart.map((i) => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price, name: i.product.name }));
      const created = await ordersApi.create(items);
      setCart([]);
      setActiveOrders((prev) => [created, ...prev]);
    } finally {
      setPlacing(false);
    }
  };

  const markFinished = async (id: string) => {
    const updated = await ordersApi.markFinished(id);
    // Keep finished orders visible until explicitly removed
    setActiveOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const removeOrder = async (id: string) => {
    await ordersApi.remove(id);
    setActiveOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const filteredMenu = useMemo(
    () => menu.filter((m) => m.name.toLowerCase().includes(filter.toLowerCase())),
    [menu, filter]
  );

  return (
    <Section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Make an Order</CardTitle>
                <div className="w-56"><Input placeholder="Search menu..." value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMenu.length === 0 ? (
                <p className="text-muted-foreground">No menu items.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredMenu.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="rounded-md border overflow-hidden text-left hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary"
                    >
                      <div className="p-3">
                        <div className="font-medium truncate" title={p.name}>{p.name}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(p.price)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">No items selected.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((i) => (
                    <div key={i.product.id} className="flex items-center justify-between gap-3 border rounded-md p-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate" title={i.product.name}>{i.product.name}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(i.product.price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          className="w-20"
                          value={i.quantity}
                          onChange={(e) => updateQty(i.product.id, Number(e.target.value || 1))}
                        />
                        <Button variant="secondary" onClick={() => removeFromCart(i.product.id)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-lg font-semibold">Total</div>
                    <div className="text-lg font-semibold">{formatCurrency(total)}</div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={placeOrder} disabled={placing || cart.length === 0}>{placing ? "Placing..." : "Place Order"}</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {activeOrders.length === 0 ? (
                <p className="text-muted-foreground">No active orders.</p>
              ) : (
                <div className="space-y-3">
                  {activeOrders.map((o) => (
                    <div key={o.id} className={cn("border rounded-md p-3", o.status === "finished" && "opacity-70")}> 
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Order #{o.number}</div>
                        <div className="text-xs px-2 py-0.5 rounded bg-muted/40 capitalize">{o.status}</div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {o.items.map((i) => (
                          <div key={i.productId} className="flex justify-between">
                            <span>{i.name} × {i.quantity}</span>
                            <span>{formatCurrency(i.price * i.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        {o.status !== "finished" && (
                          <Button variant="secondary" onClick={() => markFinished(o.id)}>Mark Finished</Button>
                        )}
                        <Button variant="destructive" onClick={() => removeOrder(o.id)}>Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
