import { useEffect, useState } from 'react';
import type { OrderSummary } from '@/lib/orders';

type StreamState = {
  preparing: OrderSummary[];
  finished: OrderSummary[];
};

type Listener = (state: StreamState) => void;

function httpToWs(url: string) {
  try {
    const u = new URL(url);
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return u.toString();
  } catch {
    return url;
  }
}

function computeWsUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return httpToWs(env.replace(/\/?$/, '') + '/ws');
  if (typeof window !== 'undefined') {
    const { location } = window;
    // If running on :3000, try backend :3001; else same host
    const is3000 = /:3000$/.test(location.host);
    const host = is3000 ? location.hostname + ':3001' : location.host;
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${host}/ws`;
  }
  return 'ws://localhost:3001/ws';
}

class OrdersStream {
  private ws: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private state: StreamState = { preparing: [], finished: [] };
  private reconnectTimer: any = null;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    // Send current snapshot
    fn(this.state);
    // Ensure connection
    this.ensure();
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn(this.state);
  }

  private ensure() {
    if (this.ws && this.ws.readyState <= 1) return; // CONNECTING or OPEN
    const url = computeWsUrl();
    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => {
        // No-op; server will push initial snapshot
      };
      this.ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string);
          if (msg?.type === 'orders:update' && msg?.data) {
            this.state = msg.data as StreamState;
            this.emit();
          }
        } catch {
          // ignore
        }
      };
      this.ws.onclose = () => {
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensure();
    }, 1500);
  }
}

const singleton = new OrdersStream();

export function useOrdersStream() {
  const [state, setState] = useState<StreamState>({ preparing: [], finished: [] });
  useEffect(() => singleton.subscribe(setState), []);
  return state;
}

export default singleton;
