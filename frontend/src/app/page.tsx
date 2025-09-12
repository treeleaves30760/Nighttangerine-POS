"use client";

import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/shared/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productsApi } from "@/lib/api";
import { ordersApi, type Order } from "@/lib/orders";
import { cn, formatCurrency } from "@/lib/utils";

function FinishedOrdersPanel() {
	const [finished, setFinished] = useState<Order[]>([]);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			const data = await ordersApi.getFinished();
			if (mounted) setFinished(data);
		};
		load();
		const id = setInterval(load, 5000);
		return () => {
			mounted = false;
			clearInterval(id);
		};
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Ready for Pickup</CardTitle>
			</CardHeader>
			<CardContent>
				{finished.length === 0 ? (
					<p className="text-muted-foreground">No finished orders yet.</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
						{finished.map((o) => (
							<div
								key={o.id}
								className={cn(
									"rounded-lg border p-4 text-center text-2xl font-bold",
									"bg-secondary/10 border-secondary/30"
								)}
							>
								{o.number}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function MenuGrid() {
	const [items, setItems] = useState<
		Awaited<ReturnType<typeof productsApi.getAvailable>>
	>([]);
	useEffect(() => {
		productsApi
			.getAvailable()
			.then(setItems)
			.catch(() => setItems([]));
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Menu</CardTitle>
			</CardHeader>
			<CardContent>
				{items.length === 0 ? (
					<p className="text-muted-foreground">No items available.</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{items.map((p) => (
							<div key={p.id} className="rounded-md border overflow-hidden">
								<div className="aspect-square bg-muted/20 flex items-center justify-center">
									<span className="text-muted-foreground">Image</span>
								</div>
								<div className="p-3">
									<div className="font-medium truncate" title={p.name}>
										{p.name}
									</div>
									<div className="text-sm text-muted-foreground">
										{formatCurrency(p.price)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default function CustomerDisplay() {
	const header = useMemo(
		() => (
			<div className="flex items-baseline justify-between mb-6">
				<h1 className="text-3xl font-bold tracking-tight">Now Serving</h1>
			</div>
		),
		[]
	);

	return (
		<Section>
			{header}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-1">
					<FinishedOrdersPanel />
				</div>
				<div className="lg:col-span-2">
					<MenuGrid />
				</div>
			</div>
		</Section>
	);
}
