"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Search, Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Order, type OrderStatus } from "@/lib/orders";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type SortField = "number" | "status" | "createdAt" | "total" | "items";
type SortDirection = "asc" | "desc";

type TableFilters = {
  search: string;
  statusFilter: OrderStatus | "all";
};

type EnhancedOrdersTableProps = {
  orders: Order[];
  onMarkFinished: (id: string) => void;
  onRemoveOrder: (id: string) => void;
  onExport: () => void;
  className?: string;
};

const statusOptions: { value: OrderStatus | "all"; label: string; color: string }[] = [
  { value: "all", label: "All Status", color: "bg-gray-100 text-gray-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "preparing", label: "Preparing", color: "bg-blue-100 text-blue-800" },
  { value: "finished", label: "Finished", color: "bg-green-100 text-green-800" },
];

export function EnhancedOrdersTable({
  orders,
  onMarkFinished,
  onRemoveOrder,
  onExport,
  className
}: EnhancedOrdersTableProps) {
  const [sortField, setSortField] = useState<SortField>("number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    statusFilter: "all"
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate totals for each order
  const ordersWithTotals = useMemo(() => {
    return orders.map(order => ({
      ...order,
      total: (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0),
      itemCount: (order.items || []).reduce((count, item) => count + item.quantity, 0)
    }));
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return ordersWithTotals.filter(order => {
      const matchesSearch = !filters.search ||
        order.number.toString().includes(filters.search) ||
        order.status.toLowerCase().includes(filters.search.toLowerCase()) ||
        (order.items || []).some(item =>
          item.name.toLowerCase().includes(filters.search.toLowerCase())
        );

      const matchesStatus = filters.statusFilter === "all" || order.status === filters.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [ordersWithTotals, filters]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case "number":
          aValue = a.number;
          bValue = b.number;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "total":
          aValue = a.total;
          bValue = b.total;
          break;
        case "items":
          aValue = a.itemCount;
          bValue = b.itemCount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortField, sortDirection]);

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedOrders, currentPage]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronDown className="size-4 opacity-50" />;
    return sortDirection === "asc" ?
      <ChevronUp className="size-4" /> :
      <ChevronDown className="size-4" />;
  };

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        statusOption?.color || "bg-gray-100 text-gray-800"
      )}>
        {status}
      </span>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <CardTitle className="text-2xl">Orders Management</CardTitle>

          <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9 min-w-48"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.statusFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value as OrderStatus | "all" }))}
              className="px-3 py-2 border rounded-md text-sm bg-background min-w-28 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <Button variant="outline" onClick={onExport} className="flex items-center gap-2 min-w-24">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground pt-2">
          Showing {paginatedOrders.length} of {sortedOrders.length} orders
          {filters.search && ` matching "${filters.search}"`}
          {filters.statusFilter !== "all" && ` with status "${filters.statusFilter}"`}
        </div>
      </CardHeader>

      <CardContent>
        {sortedOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found matching your criteria.
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort("number")}
                    >
                      <div className="flex items-center gap-1">
                        Order #
                        {getSortIcon("number")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {getSortIcon("status")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Created
                        {getSortIcon("createdAt")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none text-right"
                      onClick={() => handleSort("items")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Items
                        {getSortIcon("items")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none text-right"
                      onClick={() => handleSort("total")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Total
                        {getSortIcon("total")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow
                        className={cn(
                          "transition-colors hover:bg-muted/50",
                          order.status === "finished" && "opacity-70"
                        )}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(order.id)}
                            className="size-8 p-0"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-semibold">#{order.number}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">{order.itemCount}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {order.status !== "finished" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onMarkFinished(order.id)}
                              >
                                Finish
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRemoveOrder(order.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row Details */}
                      {expandedRows.has(order.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/20">
                            <div className="py-4">
                              <h4 className="font-semibold mb-2">Order Items:</h4>
                              <div className="grid gap-2">
                                {(order.items || []).map((item, index) => (
                                  <div key={index} className="flex justify-between items-center text-sm">
                                    <span>{item.name}</span>
                                    <span className="flex gap-4">
                                      <span>Qty: {item.quantity}</span>
                                      <span>Price: {formatCurrency(item.price)}</span>
                                      <span className="font-semibold">
                                        Total: {formatCurrency(item.price * item.quantity)}
                                      </span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}