"use client";

import { useEffect, useMemo, useState } from "react";
import { productsApi, type Product, type CreateProductData, type UpdateProductData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/shared/section";
import { cn, formatCurrency } from "@/lib/utils";

type Draft = {
  name: string;
  price: string;
  category: string;
  imageUrl: string; // stored in localStorage until backend supports it
};

const empty: Draft = { name: "", price: "", category: "", imageUrl: "" };

function useImageMap() {
  const key = "productImages";
  const getMap = () => {
    if (typeof window === "undefined") return {} as Record<string, string>;
    try {
      return JSON.parse(localStorage.getItem(key) || "{}") as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  };
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => { setMap(getMap()); }, []);
  const set = (id: string, url: string) => {
    const next = { ...map, [id]: url };
    setMap(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  const del = (id: string) => {
    const next = { ...map };
    delete next[id];
    setMap(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  return { map, set, del };
}

export default function SettingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<Draft>(empty);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const { map: imageMap, set: setImage, del: delImage } = useImageMap();

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
      imageUrl: imageMap[p.id] || "",
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
        };
        const updated = await productsApi.update(editing.id, updates);
        if (draft.imageUrl) setImage(updated.id, draft.imageUrl); else delImage(updated.id);
      } else {
        const data: CreateProductData = {
          name: draft.name.trim(),
          price: Number(draft.price),
          category: draft.category.trim(),
        };
        const created = await productsApi.create(data);
        if (draft.imageUrl) setImage(created.id, draft.imageUrl);
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
    await productsApi.delete(id);
    delImage(id);
    await reload();
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map((p) => (
                    <div key={p.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-medium truncate" title={p.name}>{p.name}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(p.price)} • {p.category}</div>
                        </div>
                        <div className={cn("text-xs px-2 py-0.5 rounded", p.available ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400")}>{p.available ? "Available" : "Hidden"}</div>
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button variant="secondary" onClick={() => onEdit(p)}>Edit</Button>
                        <Button variant="secondary" onClick={() => toggle(p.id)}>{p.available ? "Hide" : "Show"}</Button>
                        <Button variant="destructive" onClick={() => remove(p.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
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
                <div className="text-sm mb-1">Image URL</div>
                <Input placeholder="https://..." value={draft.imageUrl} onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))} />
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

