import knex from "knex";
import dbConfig from "../config/database";

const db = knex(
  dbConfig[process.env["NODE_ENV"] as keyof typeof dbConfig] ||
    dbConfig.development,
);

export type OrderStatus = "pending" | "preparing" | "finished";

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

export interface ImportOrderData {
  id: string;
  number: number;
  status: OrderStatus;
  createdAt: string;
  items: CreateOrderItem[];
}

export class OrderModel {
  static async nextOrderNumber(trx: knex.Knex): Promise<number> {
    const row = await trx("orders")
      .max<{ max?: number }>("number as max")
      .first();
    const max = row?.max || 0;
    return max + 1;
  }

  static async create(items: CreateOrderItem[]): Promise<Order> {
    return await db.transaction(async (trx) => {
      const number = await this.nextOrderNumber(trx);
      const [order] = await trx("orders")
        .insert({ number, status: "preparing" })
        .returning("*");

      const toInsert = items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        name: i.name || i.productId,
        price: i.price,
        quantity: i.quantity,
      }));
      await trx("order_items").insert(toInsert);

      const orderItems = await trx("order_items").where({ order_id: order.id });
      return { ...order, items: orderItems } as Order;
    });
  }

  static async findActive(includeHidden = false): Promise<Order[]> {
    const ordersQuery = db("orders")
      .whereNot({ status: "finished" })
      .orderBy("number", "desc");
    if (!includeHidden) (ordersQuery as any).andWhere({ hidden: false });
    const orders = await ordersQuery;
    const ids = orders.map((o) => o.id);
    const items = await db("order_items").whereIn("order_id", ids);
    const byOrder = items.reduce<Record<string, OrderItem[]>>((acc, it) => {
      (acc[it.order_id] ||= []).push(it);
      return acc;
    }, {});
    return orders.map((o) => ({ ...o, items: byOrder[o.id] || [] }));
  }

  static async findFinished(includeHidden = false): Promise<Order[]> {
    const ordersQuery = db("orders")
      .where({ status: "finished" })
      .orderBy("number", "desc");
    if (!includeHidden) (ordersQuery as any).andWhere({ hidden: false });
    const orders = await ordersQuery;
    const ids = orders.map((o) => o.id);
    const items = await db("order_items").whereIn("order_id", ids);
    const byOrder = items.reduce<Record<string, OrderItem[]>>((acc, it) => {
      (acc[it.order_id] ||= []).push(it);
      return acc;
    }, {});
    return orders.map((o) => ({ ...o, items: byOrder[o.id] || [] }));
  }

  static async markFinished(id: string): Promise<Order | null> {
    const [updated] = await db("orders")
      .where({ id })
      .update({ status: "finished", updated_at: db.fn.now() })
      .returning("*");
    if (!updated) return null;
    const items = await db("order_items").where({ order_id: id });
    return { ...updated, items } as Order;
  }

  static async delete(id: string): Promise<boolean> {
    return await db.transaction(async (trx) => {
      // First delete order items
      await trx("order_items").where({ order_id: id }).del();

      // Then delete the order
      const deleted = await trx("orders").where({ id }).del();
      return deleted > 0;
    });
  }

  static async bulkImport(orders: ImportOrderData[]): Promise<Order[]> {
    return await db.transaction(async (trx) => {
      // First, collect all unique product IDs and their details from the orders
      const allProductIds = new Set<string>();
      const productsById = new Map<string, { productId: string; name: string; price: number }>();
      const productNames = new Set<string>();

      orders.forEach(order => {
        order.items.forEach(item => {
          allProductIds.add(item.productId);
          const name = item.name || item.productId;
          productNames.add(name);
          // Store by productId instead of name to avoid overwriting
          productsById.set(item.productId, {
            productId: item.productId,
            name: name,
            price: item.price
          });
        });
      });

      console.log("Found", allProductIds.size, "unique products to check");

      // Check which products exist in the database by ID
      const existingProductsById = await trx("products")
        .whereIn("id", Array.from(allProductIds))
        .select("id", "name");

      // Check which products exist in the database by name
      const existingProductsByName = await trx("products")
        .whereIn("name", Array.from(productNames))
        .select("id", "name");

      const existingProductIds = new Set(existingProductsById.map(p => p.id));
      const existingProductNamesMap = new Map(existingProductsByName.map(p => [p.name, p.id]));

      console.log("Found", existingProductsById.length, "existing products by ID");
      console.log("Found", existingProductsByName.length, "existing products by name");

      // Create a mapping for products that need to use existing IDs
      const productIdMapping = new Map<string, string>();

      // Process each product to determine if we should create new or use existing
      for (const [productId, productInfo] of productsById) {
        if (existingProductIds.has(productId)) {
          // Product with this ID already exists, use it as-is
          productIdMapping.set(productId, productId);
          console.log("Using existing product ID:", productId, "for", productInfo.name);
        } else if (existingProductNamesMap.has(productInfo.name)) {
          // Product with this name exists, use existing product ID
          const existingId = existingProductNamesMap.get(productInfo.name)!;
          productIdMapping.set(productId, existingId);
          console.log("Mapping product", productId, "to existing product", existingId, "with name:", productInfo.name);
        } else {
          // Product doesn't exist by ID or name, create new one
          productIdMapping.set(productId, productId);
          console.log("Creating new product:", productId, productInfo.name);
          await trx("products").insert({
            id: productId,
            name: productInfo.name,
            price: productInfo.price,
            category: "imported", // Default category for imported products
            available: true,
            hidden: false,
          });
        }
      }

      const importedOrders: Order[] = [];

      for (const orderData of orders) {
        console.log("Processing order:", orderData.id, "number:", orderData.number);

        // Check if order already exists
        const existing = await trx("orders").where({ id: orderData.id }).first();

        let order;
        if (existing) {
          console.log("Replacing existing order:", orderData.id);
          // Replace existing order - delete items first
          await trx("order_items").where({ order_id: orderData.id }).del();

          // Update the order
          [order] = await trx("orders")
            .where({ id: orderData.id })
            .update({
              number: orderData.number,
              status: orderData.status,
              created_at: new Date(orderData.createdAt),
              updated_at: new Date(),
            })
            .returning("*");
        } else {
          console.log("Creating new order:", orderData.id);
          // Create the order with specified ID and data
          [order] = await trx("orders")
            .insert({
              id: orderData.id,
              number: orderData.number,
              status: orderData.status,
              created_at: new Date(orderData.createdAt),
              updated_at: new Date(orderData.createdAt),
            })
            .returning("*");
        }

        // Create order items using the product ID mapping
        const toInsert = orderData.items.map((i) => ({
          order_id: order.id,
          product_id: productIdMapping.get(i.productId) || i.productId,
          name: i.name || i.productId,
          price: i.price,
          quantity: i.quantity,
        }));

        console.log("Inserting", toInsert.length, "items for order", order.id);
        await trx("order_items").insert(toInsert);

        // Get the created items
        const orderItems = await trx("order_items").where({ order_id: order.id });
        importedOrders.push({ ...order, items: orderItems } as Order);
      }

      console.log("Total imported orders:", importedOrders.length);
      console.log("Transaction completed successfully - data should be committed to database");
      return importedOrders;
    });
  }
}

export default OrderModel;
