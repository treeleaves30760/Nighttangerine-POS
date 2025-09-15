"use client";

import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/shared/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productsApi } from "@/lib/api";
import { ordersApi, type Order } from "@/lib/orders";
import { cn, formatCurrency } from "@/lib/utils";
import { settingsApi, type DisplaySettings } from "@/lib/settings";
import { Marquee } from "@/components/shared/marquee";

function FinishedOrdersPanel() {
	const [finished, setFinished] = useState<Order[]>([]);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			const data = await ordersApi.getFinished();
			if (mounted) setFinished(data);
		};
		load();
		const id = setInterval(load, 8000);
		return () => {
			mounted = false;
			clearInterval(id);
		};
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-3xl lg:text-4xl">Ready for Pickup</CardTitle>
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
									"rounded-lg border overflow-hidden aspect-square flex items-center justify-center",
									"bg-secondary/10 border-secondary/30"
								)}
							>
								<span className="block text-center font-extrabold leading-none tracking-tight text-[clamp(2rem,6vw,3.5rem)]">
									{o.number}
								</span>
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
				<CardTitle className="text-3xl lg:text-4xl">Menu</CardTitle>
			</CardHeader>
			<CardContent>
				{items.length === 0 ? (
					<p className="text-muted-foreground">No items available.</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{items.map((p) => (
							<div key={p.id} className="rounded-md border overflow-hidden">
								<div className="aspect-square bg-muted/20 flex items-center justify-center overflow-hidden">
									{p.image_url ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={p.image_url}
											alt={p.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-muted-foreground">Image</span>
									)}
								</div>
								<div className="p-4">
									<div
										className="truncate font-semibold text-2xl"
										title={p.name}
									>
										{p.name}
									</div>
									<div className="text-xl text-muted-foreground flex items-center justify-between">
										<span className="font-medium">
											{formatCurrency(p.price)}
										</span>
										{p.amount && (
											<span className="ml-2 inline-block px-2 py-0.5 rounded bg-muted/40">
												{p.amount}
											</span>
										)}
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

function PreparingOrdersPanel() {
	const [preparing, setPreparing] = useState<Order[]>([]);
	useEffect(() => {
		let mounted = true;
		const load = async () => {
			try {
				const active = await ordersApi.getActive();
				const list = active.filter((o) => o.status === "preparing");
				if (mounted) setPreparing(list);
			} catch {
				if (mounted) setPreparing([]);
			}
		};
		load();
		const id = setInterval(load, 8000);
		return () => {
			mounted = false;
			clearInterval(id);
		};
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-3xl lg:text-4xl">Preparing</CardTitle>
			</CardHeader>
			<CardContent>
				{preparing.length === 0 ? (
					<p className="text-muted-foreground">No orders in preparation.</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
						{preparing.map((o) => (
							<div
								key={o.id}
								className="rounded-lg border overflow-hidden aspect-square flex items-center justify-center"
							>
								<span className="block text-center font-extrabold leading-none tracking-tight text-[clamp(2rem,6vw,3.5rem)]">
									{o.number}
								</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default function CustomerDisplay() {
	const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
		showMarquee: true,
		marqueeText: "夜橘深夜食堂開張中",
	});
	useEffect(() => {
		setDisplaySettings(settingsApi.get());
		const onStorage = (e: StorageEvent) => {
			if (e.key === settingsApi.key) {
				setDisplaySettings(settingsApi.get());
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	return (
		<Section>
			<div className="flex items-center gap-4 mb-6">
				<h1 className="text-5xl font-extrabold tracking-tight whitespace-nowrap">
					Now Serving
				</h1>
				{displaySettings.showMarquee && displaySettings.marqueeText.trim() && (
					<Marquee
						text={displaySettings.marqueeText}
						speed={220}
						className="ml-auto rounded-md bg-muted/20 border w-[60%] max-w-[60%] py-1"
						textClassName="text-5xl font-semibold leading-none"
					/>
				)}
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="space-y-6 lg:col-span-1">
					<PreparingOrdersPanel />
					<FinishedOrdersPanel />
				</div>
				<div className="lg:col-span-2">
					<MenuGrid />
				</div>
			</div>
		</Section>
	);
}
