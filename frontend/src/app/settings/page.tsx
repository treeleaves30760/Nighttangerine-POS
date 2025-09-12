"use client";

import { useEffect, useMemo, useState } from "react";
import { productsApi, type Product, type CreateProductData, type UpdateProductData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/shared/section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

type Draft = {
  name: string;
  price: string;
  category: string;
  amount: string;
  imageUrl: string; // stored in localStorage until backend supports it
};

const empty: Draft = { name: "", price: "", category: "", amount: "", imageUrl: "" };

// Removed local image map; using persisted image_url in backend

export default function SettingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<Draft>(empty);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  

  const reload = async () => {
    const data = await productsApi.getAll();
    setProducts(data);
  };

  useEffect(() => { reload(); }, []);

  const onEdit = (p: Product) => {
    setEditing(p);
    setDraft({
      name: p.name,
      price: String(p.price),
      category: p.category,
      amount: p.amount || "",
      imageUrl: p.image_url || "",
    });
  };

  const reset = () => { setEditing(null); setDraft(empty); };

  const submit = async () => {
    setLoading(true);
    try {
      if (editing) {
        const updates: UpdateProductData = {
          name: draft.name.trim(),
          price: Number(draft.price),
          category: draft.category.trim(),
          amount: draft.amount.trim() || null,
          image_url: draft.imageUrl.trim() || null,
        };
        await productsApi.update(editing.id, updates);
      } else {
        const data: CreateProductData = {
          name: draft.name.trim(),
          price: Number(draft.price),
          category: draft.category.trim(),
          amount: draft.amount.trim() || null,
          image_url: draft.imageUrl.trim() || null,
        };
        await productsApi.create(data);
      }
      reset();
      await reload();
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: string) => {
    await productsApi.toggleAvailability(id);
    await reload();
  };

  const remove = async (id: string) => {
    try {
      await productsApi.delete(id);
      // nothing extra
    } catch (err: any) {
      const status = err?.status;
      const message = err?.message || 'Failed to delete product';
      if (status === 409 || /foreign key|order/i.test(message)) {
        const confirmHide = window.confirm('This product has order history and cannot be deleted. Hide it instead?');
        if (confirmHide) {
          await productsApi.update(id, { hidden: true });
        } else {
          window.alert(message);
        }
      } else {
        window.alert(message);
      }
    } finally {
      await reload();
    }
  };

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())),
    [products, filter]
  );

  const canSubmit = draft.name.trim() && draft.price && !Number.isNaN(Number(draft.price)) && draft.category.trim();

  return (
    <Section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Menu Items</CardTitle>
                <div className="w-64"><Input placeholder="Search items..." value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-muted-foreground">No products.</p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[34%]">Name</TableHead>
                        <TableHead className="w-[12%]">Price</TableHead>
                        <TableHead className="w-[14%]">Category</TableHead>
                        <TableHead className="w-[15%]">Amount</TableHead>
                        <TableHead className="w-[15%]">Visibility</TableHead>
                        <TableHead className="text-right w-[10%]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell title={p.name} className="font-medium truncate max-w-[320px]">{p.name}</TableCell>
                          <TableCell>{formatCurrency(p.price)}</TableCell>
                          <TableCell>{p.category}</TableCell>
                          <TableCell>{p.amount || '-'}</TableCell>
                          <TableCell>
                            <div className={cn("inline-flex text-xs px-2 py-0.5 rounded", !p.hidden ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600")}>{!p.hidden ? "Shown" : "Hidden"}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-2">
                              <Button size="sm" variant="secondary" onClick={() => onEdit(p)}>Edit</Button>
                              <Button size="sm" variant="secondary" onClick={() => toggle(p.id)}>{!p.hidden ? "Hide" : "Show"}</Button>
                              <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>Delete</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editing ? "Edit Item" : "Add Item"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm mb-1">Name</div>
                <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              </div>
              <div>
                <div className="text-sm mb-1">Price</div>
                <Input type="number" min={0} value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
              </div>
              <div>
                <div className="text-sm mb-1">Category</div>
                <Input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
              </div>
              <div>
                <div className="text-sm mb-1">Amount</div>
                <Input placeholder="e.g. 3串 or 3個" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} />
              </div>
              <div>
                <div className="text-sm mb-1">Image URL</div>
                <Input placeholder="https://..." value={draft.imageUrl} onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))} />
                {draft.imageUrl && (
                  <div className="mt-2 rounded-md overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.imageUrl} alt="preview" className="w-full h-40 object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                {editing && <Button variant="secondary" onClick={reset}>Cancel</Button>}
                <Button onClick={submit} disabled={!canSubmit || loading}>{loading ? "Saving..." : "Save"}</Button>
              </div>
              <p className="text-xs text-muted-foreground">Note: Image URL is stored locally until backend supports it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
