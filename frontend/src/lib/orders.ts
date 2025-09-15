export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatus = 'pending' | 'preparing' | 'finished';

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  hidden?: boolean;
};

export type OrderSummary = Pick<Order, 'id' | 'number' | 'status' | 'createdAt'>;

export type CreateOrderItem = {
  productId: string;
  price: number;
  quantity: number;
  name?: string; // optional, used by local fallback
};

const DEFAULT_BASES = ['http://localhost:3001', 'http://localhost:3000'];
const ENV_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_CANDIDATES = ENV_BASE ? [ENV_BASE, ...DEFAULT_BASES.filter((b) => b !== ENV_BASE)] : DEFAULT_BASES;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// A tiny persistence layer using localStorage for demo/fallback
const LS_KEY = 'orders';
const LS_LAST_NUM = 'orders:lastNumber';

function readLS(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeLS(data: Order[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function nextNumber(): number {
  if (typeof window === 'undefined') return 1;
  const cur = Number(localStorage.getItem(LS_LAST_NUM) || '0');
  const next = cur + 1;
  localStorage.setItem(LS_LAST_NUM, String(next));
  return next;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let lastErr: unknown = null;
  for (const base of API_BASE_CANDIDATES) {
    try {
      const url = `${base}${endpoint}`;
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
      });
      if (!res.ok) {
        // Do not failover to other bases on HTTP errors (e.g., 429/404).
        lastErr = new Error(`Orders API error: ${res.status}`);
        break;
      }
      return (res.status === 204 ? null : await res.json()) as T;
    } catch (err) {
      lastErr = err;
      continue;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Orders API error');
}

export const ordersApi = {
  // Return active orders (not finished)
  async getActive(includeHidden = false): Promise<Order[]> {
    try {
      // If backend exists:
      const q = includeHidden ? '&includeHidden=1' : '';
      return await fetchApi<Order[]>(`/api/orders?status=active${q}`);
    } catch {
      const all = readLS();
      return all
        .filter((o) => (includeHidden ? true : !o.hidden) && o.status !== 'finished')
        .sort((a, b) => b.number - a.number);
    }
  },

  // Return finished orders (now with items)
  async getFinished(includeHidden = false): Promise<Order[]> {
    try {
      const q = includeHidden ? '&includeHidden=1' : '';
      return await fetchApi<Order[]>(`/api/orders?status=finished${q}`);
    } catch {
      const all = readLS();
      return all
        .filter((o) => (includeHidden ? true : !o.hidden) && o.status === 'finished')
        .sort((a, b) => b.number - a.number)
        .slice(0, 30);
    }
  },

  // Create a new order
  async create(items: CreateOrderItem[]): Promise<Order> {
    try {
      return await fetchApi<Order>('/api/orders', { method: 'POST', body: JSON.stringify({ items }) });
    } catch {
      // Fallback local creation
      const all = readLS();
      const id = uid();
      const number = nextNumber();
      const createdAt = new Date().toISOString();
      const order: Order = {
        id,
        number,
        createdAt,
        status: 'preparing',
        items: items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity, name: i.name || i.productId })),
      };
      writeLS([order, ...all]);
      return order;
    }
  },

  // Mark order finished
  async markFinished(id: string): Promise<Order> {
    try {
      return await fetchApi<Order>(`/api/orders/${id}/finish`, { method: 'PATCH' });
    } catch {
      const all = readLS();
      const idx = all.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error('Not found');
      const updated: Order = { ...all[idx], status: 'finished' };
      const next = [...all];
      next[idx] = updated;
      writeLS(next);
      return updated;
    }
  },

  // Remove order (e.g., customer has taken it)
  async remove(id: string): Promise<void> {
    try {
      await fetchApi<void>(`/api/orders/${id}`, { method: 'DELETE' });
    } catch {
      const all = readLS();
      const idx = all.findIndex((o) => o.id === id);
      if (idx !== -1) {
        const next = [...all];
        next[idx] = { ...next[idx], hidden: true } as Order;
        writeLS(next);
      }
    }
  },

  // Bulk import orders
  async bulkImport(orders: Order[]): Promise<Order[]> {
    try {
      // Transform orders to match the backend ImportOrderData structure
      const importData = orders.map(order => ({
        id: order.id,
        number: order.number,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }));

      console.log("Sending to API:", { orders: importData });

      const response = await fetchApi<{ imported: number; orders: Order[] }>('/api/orders/import', {
        method: 'POST',
        body: JSON.stringify({ orders: importData }),
      });
      return response.orders;
    } catch (error) {
      console.error("API import failed:", error);
      // Fallback to local storage for demo
      const all = readLS();
      const newOrders = orders.filter(order => !all.find(existing => existing.id === order.id));
      const updated = [...all, ...newOrders];
      writeLS(updated);
      return newOrders;
    }
  },
};
