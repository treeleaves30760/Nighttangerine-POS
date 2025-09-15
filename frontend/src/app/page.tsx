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
		<Card className="border-none bg-white/70 dark:bg-white/5 backdrop-blur shadow-xl">
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
									"rounded-xl overflow-hidden aspect-square flex items-center justify-center text-white",
									"bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg"
								)}
							>
								<span className="block text-center font-extrabold leading-none tracking-tight text-[clamp(2rem,6vw,3.5rem)] drop-shadow">
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
		<Card className="border-none bg-white/70 dark:bg-white/5 backdrop-blur shadow-2xl">
			<CardHeader>
				<CardTitle className="text-3xl lg:text-4xl">Menu</CardTitle>
			</CardHeader>
			<CardContent>
				{items.length === 0 ? (
					<p className="text-muted-foreground">No items available.</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
						{items.map((p) => (
							<div key={p.id} className="group relative rounded-2xl overflow-hidden shadow-lg ring-1 ring-orange-100/60 dark:ring-white/10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-amber-200/40">
								<div className="relative aspect-square bg-muted/10 flex items-center justify-center overflow-hidden">
									{p.image_url ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={p.image_url}
											alt={p.name}
											className="w-full h-full object-cover scale-105 transition-transform duration-500 group-hover:scale-110"
										/>
									) : (
										<span className="text-muted-foreground">Image</span>
									)}
									{/* soft top gradient for text readability */}
									<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />

									{/* price pill */}
									<div className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xl font-semibold px-3 py-1 shadow-md">
										{formatCurrency(p.price)}
									</div>
								</div>
								<div className="p-4 bg-white/80 dark:bg-white/5 backdrop-blur">
									<div
										className="truncate font-extrabold text-2xl text-orange-700 dark:text-orange-300"
										title={p.name}
									>
										{p.name}
									</div>
									<div className="text-xl text-muted-foreground flex items-center justify-end">
										{p.amount && (
											<span className="ml-2 inline-block px-2 py-0.5 rounded bg-orange-100/70 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
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
		<Card className="border-none bg-white/70 dark:bg-white/5 backdrop-blur shadow-xl">
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
								className="rounded-xl overflow-hidden aspect-square flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg"
							>
								<span className="block text-center font-extrabold leading-none tracking-tight text-[clamp(2rem,6vw,3.5rem)] drop-shadow">
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
		<Section className="relative min-h-screen overflow-hidden bg-[radial-gradient(1200px_600px_at_-10%_-20%,rgba(255,159,67,0.12),transparent_50%),radial-gradient(900px_500px_at_110%_10%,rgba(239,68,68,0.10),transparent_50%)] dark:bg-[radial-gradient(1200px_600px_at_-10%_-20%,rgba(255,159,67,0.10),transparent_50%),radial-gradient(900px_500px_at_110%_10%,rgba(239,68,68,0.08),transparent_50%)]">
			<div className="flex items-end gap-4 mb-6">
				<h1 className="text-5xl font-extrabold tracking-tight whitespace-nowrap bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
					Now Serving
				</h1>
				{displaySettings.showMarquee && displaySettings.marqueeText.trim() && (
					<Marquee
						text={displaySettings.marqueeText}
						speed={220}
						className="ml-auto rounded-full border border-orange-200/40 bg-gradient-to-r from-orange-100/70 to-amber-100/70 dark:from-orange-950/40 dark:to-red-950/40 shadow-sm w-[60%] max-w-[60%] py-1 px-3 backdrop-blur"
						textClassName="text-5xl font-semibold leading-none text-orange-700 dark:text-orange-200"
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
