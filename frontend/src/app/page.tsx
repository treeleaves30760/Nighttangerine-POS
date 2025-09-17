"use client";

import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/shared/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Marquee } from "@/components/shared/marquee";
import { productsApi } from "@/lib/api";
import { cartStorage, type CartSnapshot } from "@/lib/cart-storage";
import { cn, formatCurrency } from "@/lib/utils";
import { settingsApi, type DisplaySettings } from "@/lib/settings";

function useCartSnapshot() {
	const [snapshot, setSnapshot] = useState<CartSnapshot>(() =>
		cartStorage.get()
	);

	useEffect(() => cartStorage.subscribe(setSnapshot), []);

	return snapshot;
}

function CartSummaryCard() {
	const snapshot = useCartSnapshot();

	const lastUpdated = useMemo(() => {
		if (!snapshot.updatedAt) return "";
		try {
			return new Intl.DateTimeFormat(undefined, {
				hour: "2-digit",
				minute: "2-digit",
			}).format(new Date(snapshot.updatedAt));
		} catch {
			return "";
		}
	}, [snapshot.updatedAt]);

	return (
		<Card className="flex h-full flex-col border-none bg-white/70 shadow-xl backdrop-blur dark:bg-white/5">
			<CardHeader className="pb-0">
				<CardTitle className="text-3xl lg:text-4xl">Current Order</CardTitle>
				{lastUpdated && (
					<p className="text-lg text-muted-foreground">Updated {lastUpdated}</p>
				)}
			</CardHeader>
			<CardContent className="flex flex-1 flex-col pt-6">
				<div className="flex-1 overflow-y-auto pr-1 min-h-0">
					{snapshot.items.length === 0 ? (
						<div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-orange-200/60 px-6 py-12 text-center text-xl text-muted-foreground dark:border-white/15">
							Waiting for the next order...
						</div>
					) : (
						<div className="space-y-3">
							{snapshot.items.map((item) => (
								<div
									key={item.productId}
									className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-orange-100/50 dark:bg-white/5 dark:ring-white/10"
								>
									<div className="flex flex-wrap items-baseline gap-2">
										<span
											className="text-2xl font-semibold text-orange-800 dark:text-orange-200"
											title={item.name}
										>
											{item.name}
										</span>
										{item.amount && (
											<span className="rounded-full bg-orange-100/80 px-3 py-0.5 text-base font-semibold uppercase tracking-wide text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
												{item.amount}
											</span>
										)}
										<span className="text-lg font-semibold text-muted-foreground">
											× {item.quantity}
										</span>
									</div>
									<span className="ml-auto text-3xl font-bold text-orange-600 dark:text-orange-300">
										{formatCurrency(item.price * item.quantity)}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
				<div className="mt-6">
					<div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-white shadow-lg">
						<span className="text-2xl font-semibold uppercase tracking-wide">
							TOTAL
						</span>
						<span className="text-3xl font-bold">
							{formatCurrency(snapshot.total)}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function MenuShowcase() {
	const [items, setItems] = useState<
		Awaited<ReturnType<typeof productsApi.getAvailable>>
	>([]);
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		productsApi
			.getAvailable()
			.then(setItems)
			.catch(() => setItems([]));
	}, []);

	useEffect(() => {
		if (items.length === 0) {
			setActiveIndex(0);
			return;
		}
		setActiveIndex((prev) => (prev >= items.length ? 0 : prev));
	}, [items.length]);

	useEffect(() => {
		if (items.length <= 1) return;
		const timer = window.setInterval(
			() => setActiveIndex((prev) => (prev + 1) % items.length),
			6000
		);
		return () => window.clearInterval(timer);
	}, [items.length]);

	const sortedItems = useMemo(
		() => [...items].sort((a, b) => a.name.localeCompare(b.name)),
		[items]
	);

	return (
		<Card className="border-none bg-white/70 dark:bg-white/5 backdrop-blur shadow-2xl">
			<CardHeader>
				<CardTitle className="text-3xl lg:text-4xl">Menu</CardTitle>
			</CardHeader>
			<CardContent>
				{items.length === 0 ? (
					<p className="text-muted-foreground">No items available.</p>
				) : (
					<div className="flex flex-col gap-6 lg:flex-row">
						<div className="lg:w-2/5 max-h-[60vh] overflow-y-auto pr-1">
							<ul className="space-y-4">
								{sortedItems.map((item) => (
									<li
										key={item.id}
										className="flex flex-wrap items-center gap-3 border-b border-orange-100/50 pb-3 last:border-b-0 last:pb-0 dark:border-white/10"
									>
										<div className="flex flex-1 flex-wrap items-center gap-3">
											<p
												className="truncate text-3xl font-bold text-orange-100 dark:text-orange-200"
												title={item.name}
											>
												{item.name}
											</p>
											{item.amount && (
												<span className="rounded-full bg-orange-100/80 px-3 py-1 text-xl font-semibold uppercase tracking-wide text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
													{item.amount}
												</span>
											)}
										</div>
										<p className="ml-auto text-2xl font-bold text-orange-400 dark:text-orange-200">
											{formatCurrency(item.price)}
										</p>
									</li>
								))}
							</ul>
						</div>
						<div className="flex-1">
							<div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted/20 shadow-2xl">
								{items.map((item, idx) => (
									<div
										key={item.id}
										className={cn(
											"absolute inset-0 flex flex-col",
											"transition-opacity duration-700 ease-out",
											idx === activeIndex
												? "opacity-100"
												: "opacity-0 pointer-events-none"
										)}
									>
										<div className="relative flex-1">
											{item.image_url ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={item.image_url}
													alt={item.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-orange-100/40 text-2xl font-semibold text-orange-600 dark:bg-orange-900/40 dark:text-orange-200">
													No image available
												</div>
											)}
											<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
										</div>
										<div className="flex flex-wrap items-center justify-between gap-4 p-6 text-white">
											<div className="flex flex-wrap items-center gap-4">
												<p className="text-4xl font-extrabold drop-shadow-lg md:text-5xl">
													{item.name}
												</p>
												{item.amount && (
													<span className="rounded-full bg-white/25 px-4 py-1 text-2xl font-semibold uppercase tracking-wide drop-shadow">
														{item.amount}
													</span>
												)}
											</div>
											<p className="text-4xl font-extrabold drop-shadow-lg md:text-5xl">
												{formatCurrency(item.price)}
											</p>
										</div>
									</div>
								))}
							</div>
							{items.length > 1 && (
								<div className="mt-4 flex justify-center gap-2">
									{items.map((item, idx) => (
										<button
											key={item.id}
											type="button"
											onClick={() => setActiveIndex(idx)}
											className={cn(
												"h-2.5 w-8 rounded-full transition-colors",
												idx === activeIndex
													? "bg-orange-500"
													: "bg-orange-200/70 hover:bg-orange-300/80 dark:bg-white/20 dark:hover:bg-white/30"
											)}
											aria-label={`Show ${item.name}`}
										/>
									))}
								</div>
							)}
						</div>
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
		const onStorage = (event: StorageEvent) => {
			if (event.key === settingsApi.key) {
				setDisplaySettings(settingsApi.get());
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	return (
		<Section
			className="relative h-[85vh] overflow-hidden bg-[radial-gradient(1200px_600px_at_-10%_-20%,rgba(255,159,67,0.12),transparent_50%),radial-gradient(900px_500px_at_110%_10%,rgba(239,68,68,0.10),transparent_50%)] dark:bg-[radial-gradient(1200px_600px_at_-10%_-20%,rgba(255,159,67,0.10),transparent_50%),radial-gradient(900px_500px_at_110%_10%,rgba(239,68,68,0.08),transparent_50%)]"
			innerClassName="flex h-full flex-col px-6 pb-4 pt-8 md:px-10 lg:px-16"
		>
			<div className="mb-8 flex items-end gap-4">
				<h1 className="pb-1 text-5xl font-extrabold tracking-tight whitespace-nowrap bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm leading-[1.08]">
					Now Serving
				</h1>
				{displaySettings.showMarquee && displaySettings.marqueeText.trim() && (
					<Marquee
						text={displaySettings.marqueeText}
						speed={220}
						className="ml-auto w-[60%] max-w-[60%] rounded-full border border-orange-200/40 bg-gradient-to-r from-orange-100/70 to-amber-100/70 py-1 px-3 shadow-sm backdrop-blur dark:from-orange-950/40 dark:to-red-950/40"
						textClassName="text-5xl font-semibold leading-none text-orange-700 dark:text-orange-200"
					/>
				)}
			</div>
			<div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
				<CartSummaryCard />
				<MenuShowcase />
			</div>
		</Section>
	);
}
