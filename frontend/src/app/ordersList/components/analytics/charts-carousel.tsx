"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Order } from "@/lib/orders";
import { useOrdersAnalytics } from "@/components/shared/orders-analysis/use-orders-analytics";

// Import existing chart components
import { StatusPie } from "@/components/shared/orders-analysis/status-pie";
import { WeekdayBar } from "@/components/shared/orders-analysis/weekday-bar";
import { HourlyBar } from "@/components/shared/orders-analysis/hourly-bar";
import { OrdersPerDayBar } from "@/components/shared/orders-analysis/orders-per-day-bar";
import { RevenueTrend } from "@/components/shared/orders-analysis/revenue-trend";
import { SizeDistribution } from "@/components/shared/orders-analysis/size-distribution";
import { TopItemsQuantityTable } from "@/components/shared/orders-analysis/top-items-quantity-table";
import { TopItemsRevenueBar } from "@/components/shared/orders-analysis/top-items-revenue-bar";

type ChartsCarouselProps = {
	orders: Order[];
	className?: string;
};

type ChartSection = {
	id: string;
	title: string;
	charts: React.ReactNode[];
};

export function ChartsCarousel({ orders, className }: ChartsCarouselProps) {
	const [activeSection, setActiveSection] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);
	const metrics = useOrdersAnalytics(orders);

	const chartSections: ChartSection[] = [
		{
			id: "overview",
			title: "Overview",
			charts: [
				<StatusPie key="status" data={metrics.statusDist} />,
				<RevenueTrend key="revenue" data={metrics.revenueTrend} />,
				<OrdersPerDayBar key="orders-day" data={metrics.ordersByDay} />,
			],
		},
		{
			id: "performance",
			title: "Performance",
			charts: [
				<WeekdayBar key="weekday" data={metrics.weekdayData} />,
				<HourlyBar key="hourly" data={metrics.hourlyData} />,
				<SizeDistribution key="size" data={metrics.sizeDist} />,
			],
		},
		{
			id: "products",
			title: "Top Products",
			charts: [
				<TopItemsQuantityTable key="top-quantity" items={metrics.topItems} />,
				<TopItemsRevenueBar
					key="top-revenue"
					items={metrics.topItemsByRevenue}
				/>,
			],
		},
	];

	const scrollToSection = (sectionIndex: number) => {
		setActiveSection(sectionIndex);
		if (scrollRef.current) {
			const sectionWidth = scrollRef.current.scrollWidth / chartSections.length;
			scrollRef.current.scrollTo({
				left: sectionIndex * sectionWidth,
				behavior: "smooth",
			});
		}
	};

	const handleScroll = () => {
		if (scrollRef.current) {
			const scrollLeft = scrollRef.current.scrollLeft;
			const sectionWidth = scrollRef.current.scrollWidth / chartSections.length;
			const newActiveSection = Math.round(scrollLeft / sectionWidth);
			if (newActiveSection !== activeSection) {
				setActiveSection(newActiveSection);
			}
		}
	};

	return (
		<div className={cn("space-y-6", className)}>
			{/* Section Navigation */}
			<div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3 flex-wrap">
					{chartSections.map((section, index) => (
						<Button
							key={section.id}
							variant={activeSection === index ? "default" : "outline"}
							size="sm"
							onClick={() => scrollToSection(index)}
							className="min-w-24"
						>
							{section.title}
						</Button>
					))}
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<Button
						variant="outline"
						size="sm"
						onClick={() => scrollToSection(Math.max(0, activeSection - 1))}
						disabled={activeSection === 0}
					>
						<ChevronLeft className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							scrollToSection(
								Math.min(chartSections.length - 1, activeSection + 1)
							)
						}
						disabled={activeSection === chartSections.length - 1}
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>
			</div>

			{/* Charts Container */}
			<div
				ref={scrollRef}
				onScroll={handleScroll}
				className="flex overflow-x-auto snap-x snap-mandatory mb-2"
				style={{
					scrollbarWidth: "none",
					msOverflowStyle: "none"
				}}
			>
				{chartSections.map((section) => (
					<div key={section.id} className="w-full shrink-0 snap-start">
						<Card className="h-screen flex flex-col md:h-[85vh]">
							<CardHeader className="shrink-0">
								<CardTitle className="text-xl">
									{section.title} Analytics
								</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 overflow-auto">
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 h-full">
									{section.charts.map((chart, chartIndex) => (
										<div
											key={chartIndex}
											className="transition-transform duration-200 hover:scale-105 flex"
										>
											<div className="w-full">{chart}</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				))}
			</div>

			{/* Section Indicators */}
			<div className="flex justify-center gap-2">
				{chartSections.map((_, index) => (
					<button
						key={index}
						onClick={() => scrollToSection(index)}
						className={cn(
							"size-2 rounded-full transition-colors",
							activeSection === index ? "bg-primary" : "bg-muted"
						)}
					/>
				))}
			</div>
		</div>
	);
}
