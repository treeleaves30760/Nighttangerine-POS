import type { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import OrderModel from './models/Order';

type OrderSummary = {
  id: string;
  number: number;
  status: 'pending' | 'preparing' | 'finished';
  createdAt: string;
};

type OutboundMessage =
  | { type: 'hello'; data: { version: string } }
  | { type: 'orders:update'; data: { preparing: OrderSummary[]; finished: OrderSummary[] } };

let wss: WebSocketServer | null = null;

function toSummary<T extends { id: string; number: number; status: string; created_at: Date }>(o: T): OrderSummary {
  return { id: o.id, number: o.number, status: o.status as any, createdAt: o.created_at.toISOString() };
}

async function buildSnapshot() {
  const [active, finished] = await Promise.all([
    OrderModel.findActive(false),
    OrderModel.findFinished(false),
  ]);
  const preparing = active.filter((o) => o.status === 'preparing').map(toSummary);
  return {
    preparing,
    finished: finished.map(toSummary),
  };
}

export async function broadcastOrders() {
  if (!wss) return;
  try {
    const snapshot = await buildSnapshot();
    const payload: OutboundMessage = { type: 'orders:update', data: snapshot };
    const raw = JSON.stringify(payload);
    wss.clients.forEach((client: WebSocket) => {
      if ((client as any).readyState === 1) {
        try {
          client.send(raw);
        } catch {}
      }
    });
  } catch (err) {
    console.error('Failed to broadcast orders:', err);
  }
}

export function initWebSocket(server: Server) {
  if (wss) return wss;
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (socket: WebSocket) => {
    try {
      socket.send(JSON.stringify({ type: 'hello', data: { version: '1' } } satisfies OutboundMessage));
      const snapshot = await buildSnapshot();
      socket.send(JSON.stringify({ type: 'orders:update', data: snapshot } satisfies OutboundMessage));
    } catch {}

    socket.on('message', (_data: WebSocket.RawData) => {
      // read-only
    });
  });

  console.log('🔌 WebSocket server mounted at /ws');
  return wss;
}

