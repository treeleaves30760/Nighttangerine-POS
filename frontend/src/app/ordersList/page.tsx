"use client";

import { useEffect, useState, useCallback } from "react";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { ordersApi, type Order, type OrderStatus } from "@/lib/orders";

// Import new components
import { TimePeriodFilter } from "./components/filters/time-period-filter";
import { ExecutiveSummary } from "./components/analytics/executive-summary";
import { ChartsCarousel } from "./components/analytics/charts-carousel";
import { EnhancedOrdersTable } from "./components/orders-table/enhanced-orders-table";
import { BackupManager } from "@/components/backup/backup-manager";

// Import hooks
import { useFilteredOrders, useOrdersStats } from "./hooks/use-filtered-orders";
import { useUrlFilterState } from "./hooks/use-url-state";

export default function OrdersListPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);

	// URL-synced filter state
	const { timePeriodFilter, setTimePeriodFilter } = useUrlFilterState();

	// Load orders
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const [active, finished, completed] = await Promise.all([
					ordersApi.getActive(true),
					ordersApi.getFinished(true),
					ordersApi.getCompleted(true),
				]);
				if (!mounted) return;
				const merged = [...active, ...finished, ...completed].sort(
					(a, b) => b.number - a.number
				);
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

	// Filter orders based on time period
	const filteredOrders = useFilteredOrders(orders, {
		timePeriod: timePeriodFilter,
	});

	// Get analytics stats for filtered orders
	const stats = useOrdersStats(filteredOrders);

	// Order management functions
	const markFinished = useCallback(async (id: string) => {
		try {
			const updated = await ordersApi.markFinished(id);
			setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
		} catch {
			// noop
		}
	}, []);

	const removeOrder = useCallback(async (id: string) => {
		try {
			await ordersApi.remove(id);
			setOrders((prev) => prev.filter((o) => o.id !== id));
		} catch {
			// noop
		}
	}, []);

	const handleExport = useCallback(() => {
		const ordersToExport = filteredOrders.length > 0 ? filteredOrders : orders;
		const csv = [
			["id", "number", "status", "createdAt", "items"].join(","),
			...ordersToExport.map((o) =>
				[
					o.id,
					o.number,
					o.status,
					o.createdAt,
					`"${JSON.stringify(o.items).replace(/"/g, '""')}"`,
				].join(",")
			),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`orders_${timePeriodFilter.preset}_export.csv`
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}, [filteredOrders, orders, timePeriodFilter.preset]);

	const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = async (e) => {
			const text = e.target?.result as string;
			const lines = text.split("\n").filter((line) => line.trim());
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
					} else if (char === "," && !inQuotes) {
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

			try {
				// Use the bulk import API to save to database
				const savedOrders = await ordersApi.bulkImport(importedOrders);

				// Refresh the orders list to show the imported data from database
				const [active, finished] = await Promise.all([
					ordersApi.getActive(true),
					ordersApi.getFinished(true),
				]);
				const merged = [...active, ...finished].sort(
					(a, b) => b.number - a.number
				);
				setOrders(merged);

				console.log(`Successfully imported ${savedOrders.length} orders`);
			} catch (error) {
				console.error("Error importing orders:", error);
				// Fallback to local state update if API fails
				setOrders((prev) =>
					[...prev, ...importedOrders].sort((a, b) => b.number - a.number)
				);
			}
		};
		reader.readAsText(file);
	};

	if (loading) {
		return (
			<Section className="text-[18px] md:text-[20px]">
				<div className="flex items-center justify-center h-96">
					<p className="text-muted-foreground text-xl">Loading dashboard...</p>
				</div>
			</Section>
		);
	}

	return (
		<Section className="space-y-8 text-[18px] md:text-[20px] max-w-none">
			{/* Header with Filters */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
				<div className="space-y-2 pb-2">
					<h1 className="text-3xl font-bold tracking-tight">
						Business Analytics Dashboard
					</h1>
					<p className="text-muted-foreground">
						Comprehensive insights into your order performance and business
						metrics
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
					<TimePeriodFilter
						value={timePeriodFilter}
						onChange={setTimePeriodFilter}
					/>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={handleExport}
							className="min-w-24"
						>
							Export Data
						</Button>
						<Button
							variant="outline"
							onClick={() => document.getElementById("import-input")?.click()}
						>
							Import
						</Button>
						<input
							type="file"
							id="import-input"
							accept=".csv"
							className="hidden"
							onChange={handleImport}
						/>
					</div>
				</div>
			</div>

			{/* Executive Summary */}
			<ExecutiveSummary stats={stats} />

			{/* Charts Carousel */}
			<ChartsCarousel orders={filteredOrders} />

			{/* Database Backup Manager */}
			<BackupManager />

			{/* Enhanced Orders Table */}
			<EnhancedOrdersTable
				orders={filteredOrders}
				onMarkFinished={markFinished}
				onRemoveOrder={removeOrder}
				onExport={handleExport}
			/>

			{/* Footer Stats */}
			<div className="text-center text-sm text-muted-foreground pt-6 border-t">
				Dashboard showing {filteredOrders.length} of {orders.length} total
				orders
				{timePeriodFilter.preset !== "custom" &&
					` (${timePeriodFilter.preset})`}
			</div>
		</Section>
	);
}
