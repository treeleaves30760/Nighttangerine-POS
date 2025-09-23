import express, { Router } from "express";
import knex from "knex";
import dbConfig from "../config/database";

const router: Router = express.Router();

const db = knex(
  dbConfig[process.env["NODE_ENV"] as keyof typeof dbConfig] ||
    dbConfig.development,
);

// GET /api/backup/export - Export complete database backup
router.get("/export", async (_req, res) => {
  try {
    console.log("Starting database backup export...");

    // Get all orders with their items
    const orders = await db("orders")
      .select("*")
      .orderBy("number", "desc");

    const orderItems = await db("order_items")
      .select("*");

    // Get all products
    const products = await db("products")
      .select("*")
      .orderBy("name");

    // Organize order items by order_id
    const itemsByOrder = orderItems.reduce<Record<string, any[]>>((acc, item) => {
      (acc[item.order_id] ||= []).push({
        productId: item.product_id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      });
      return acc;
    }, {});

    // Structure the backup data
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      orders: orders.map(order => ({
        id: order.id,
        number: order.number,
        status: order.status,
        createdAt: order.created_at.toISOString(),
        updatedAt: order.updated_at.toISOString(),
        hidden: order.hidden || false,
        items: itemsByOrder[order.id] || [],
      })),
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.category,
        available: product.available,
        hidden: product.hidden || false,
        createdAt: product.created_at?.toISOString(),
        updatedAt: product.updated_at?.toISOString(),
      })),
    };

    console.log(`Backup created: ${orders.length} orders, ${products.length} products`);

    // Set headers for file download
    const filename = `nighttangerine-pos-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.json(backupData);
  } catch (err) {
    console.error("Error creating backup:", err);
    return res.status(500).json({ error: "Failed to create backup" });
  }
});

// POST /api/backup/import - Import database backup
router.post("/import", async (req, res) => {
  try {
    console.log("Starting database backup import...");

    const backupData = req.body;

    if (!backupData || !backupData.orders || !backupData.products) {
      return res.status(400).json({ error: "Invalid backup data format" });
    }

    let importedOrders = 0;
    let importedProducts = 0;

    await db.transaction(async (trx) => {
      // Import products first
      for (const product of backupData.products) {
        const existing = await trx("products").where({ id: product.id }).first();

        if (existing) {
          // Update existing product
          await trx("products")
            .where({ id: product.id })
            .update({
              name: product.name,
              price: product.price,
              category: product.category,
              available: product.available,
              hidden: product.hidden,
              updated_at: new Date(),
            });
        } else {
          // Create new product
          await trx("products").insert({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category || "imported",
            available: product.available ?? true,
            hidden: product.hidden || false,
            created_at: product.createdAt ? new Date(product.createdAt) : new Date(),
            updated_at: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          });
        }
        importedProducts++;
      }

      // Import orders
      for (const orderData of backupData.orders) {
        const existing = await trx("orders").where({ id: orderData.id }).first();

        let order;
        if (existing) {
          // Update existing order
          [order] = await trx("orders")
            .where({ id: orderData.id })
            .update({
              number: orderData.number,
              status: orderData.status,
              hidden: orderData.hidden,
              created_at: new Date(orderData.createdAt),
              updated_at: new Date(orderData.updatedAt || orderData.createdAt),
            })
            .returning("*");

          // Delete existing order items
          await trx("order_items").where({ order_id: orderData.id }).del();
        } else {
          // Create new order
          [order] = await trx("orders")
            .insert({
              id: orderData.id,
              number: orderData.number,
              status: orderData.status,
              hidden: orderData.hidden || false,
              created_at: new Date(orderData.createdAt),
              updated_at: new Date(orderData.updatedAt || orderData.createdAt),
            })
            .returning("*");
        }

        // Create order items
        if (orderData.items && orderData.items.length > 0) {
          const toInsert = orderData.items.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId,
            name: item.name || item.productId,
            price: item.price,
            quantity: item.quantity,
          }));

          await trx("order_items").insert(toInsert);
        }

        importedOrders++;
      }

      console.log(`Import completed: ${importedOrders} orders, ${importedProducts} products`);
    });

    return res.json({
      success: true,
      imported: {
        orders: importedOrders,
        products: importedProducts,
      },
      message: "Database backup imported successfully",
    });
  } catch (err) {
    console.error("Error importing backup:", err);
    return res.status(500).json({ error: "Failed to import backup" });
  }
});

// GET /api/backup/info - Get backup system information
router.get("/info", async (_req, res) => {
  try {
    const ordersCount = await db("orders").count("* as count").first();
    const productsCount = await db("products").count("* as count").first();
    const orderItemsCount = await db("order_items").count("* as count").first();

    return res.json({
      database: {
        orders: Number(ordersCount?.['count'] || 0),
        products: Number(productsCount?.['count'] || 0),
        orderItems: Number(orderItemsCount?.['count'] || 0),
      },
      lastBackup: null, // Could be enhanced to track backup history
    });
  } catch (err) {
    console.error("Error getting backup info:", err);
    return res.status(500).json({ error: "Failed to get backup information" });
  }
});

export default router;