import knex from 'knex';
import dbConfig from '../config/database';

const db = knex(dbConfig[process.env['NODE_ENV'] as keyof typeof dbConfig] || dbConfig.development);

export type OrderStatus = 'pending' | 'preparing' | 'finished';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
}

export interface CreateOrderItem {
  productId: string;
  name?: string;
  price: number;
  quantity: number;
}

export class OrderModel {
  static async nextOrderNumber(trx: knex.Knex): Promise<number> {
    const row = await trx('orders').max<{ max?: number }>('number as max').first();
    const max = row?.max || 0;
    return max + 1;
  }

  static async create(items: CreateOrderItem[]): Promise<Order> {
    return await db.transaction(async (trx) => {
      const number = await this.nextOrderNumber(trx);
      const [order] = await trx('orders')
        .insert({ number, status: 'preparing' })
        .returning('*');

      const toInsert = items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        name: i.name || i.productId,
        price: i.price,
        quantity: i.quantity,
      }));
      await trx('order_items').insert(toInsert);

      const orderItems = await trx('order_items').where({ order_id: order.id });
      return { ...order, items: orderItems } as Order;
    });
  }

  static async findActive(includeHidden = false): Promise<Order[]> {
    const ordersQuery = db('orders')
      .whereNot({ status: 'finished' })
      .orderBy('number', 'desc');
    if (!includeHidden) (ordersQuery as any).andWhere({ hidden: false });
    const orders = await ordersQuery;
    const ids = orders.map((o) => o.id);
    const items = await db('order_items').whereIn('order_id', ids);
    const byOrder = items.reduce<Record<string, OrderItem[]>>((acc, it) => {
      (acc[it.order_id] ||= []).push(it);
      return acc;
    }, {});
    return orders.map((o) => ({ ...o, items: byOrder[o.id] || [] }));
  }

  static async findFinished(includeHidden = false): Promise<Order[]> {
    const ordersQuery = db('orders')
      .where({ status: 'finished' })
      .orderBy('number', 'desc')
      .limit(50);
    if (!includeHidden) (ordersQuery as any).andWhere({ hidden: false });
    const orders = await ordersQuery;
    const ids = orders.map((o) => o.id);
    const items = await db('order_items').whereIn('order_id', ids);
    const byOrder = items.reduce<Record<string, OrderItem[]>>((acc, it) => {
      (acc[it.order_id] ||= []).push(it);
      return acc;
    }, {});
    return orders.map((o) => ({ ...o, items: byOrder[o.id] || [] }));
  }

  static async markFinished(id: string): Promise<Order | null> {
    const [updated] = await db('orders')
      .where({ id })
      .update({ status: 'finished', updated_at: db.fn.now() })
      .returning('*');
    if (!updated) return null;
    const items = await db('order_items').where({ order_id: id });
    return { ...updated, items } as Order;
  }

  static async delete(id: string): Promise<boolean> {
    const updated = await db('orders').where({ id }).update({ hidden: true, updated_at: db.fn.now() });
    return updated > 0;
  }
}

export default OrderModel;
