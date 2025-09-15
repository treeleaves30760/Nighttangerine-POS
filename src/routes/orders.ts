import express, { Router } from "express";
import OrderModel, { CreateOrderItem, ImportOrderData } from "../models/Order";

const router: Router = express.Router();

// GET /api/orders?status=active|finished
router.get("/", async (req, res) => {
  try {
    const status = String(req.query["status"] || "active");
    const includeHidden = String(
      req.query["includeHidden"] || "",
    ).toLowerCase();
    const withHidden = includeHidden === "1" || includeHidden === "true";
    if (status === "finished") {
      // Finished with items for clerk view
      const orders = await OrderModel.findFinished(withHidden);
      return res.json(
        orders.map((o) => ({
          id: o.id,
          number: o.number,
          status: o.status,
          createdAt: o.created_at,
          items: (o.items || []).map((i) => ({
            productId: i.product_id,
            name: i.name,
            price: Number(i.price),
            quantity: i.quantity,
          })),
        })),
      );
    }
    // active = not finished, with items
    const orders = await OrderModel.findActive(withHidden);
    return res.json(
      orders.map((o) => ({
        id: o.id,
        number: o.number,
        status: o.status,
        createdAt: o.created_at,
        items: (o.items || []).map((i) => ({
          productId: i.product_id,
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
        })),
      })),
    );
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const items: CreateOrderItem[] = Array.isArray(req.body?.items)
      ? req.body.items
      : [];
    if (items.length === 0)
      return res.status(400).json({ error: "Items are required" });
    const created = await OrderModel.create(items);
    return res.status(201).json({
      id: created.id,
      number: created.number,
      status: created.status,
      createdAt: created.created_at,
      items: (created.items || []).map((i) => ({
        productId: i.product_id,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
      })),
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// PATCH /api/orders/:id/finish
router.patch("/:id/finish", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await OrderModel.markFinished(id);
    if (!updated) return res.status(404).json({ error: "Order not found" });
    return res.json({
      id: updated.id,
      number: updated.number,
      status: updated.status,
      createdAt: updated.created_at,
      items: (updated.items || []).map((i) => ({
        productId: i.product_id,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
      })),
    });
  } catch (err) {
    console.error("Error finishing order:", err);
    return res.status(500).json({ error: "Failed to finish order" });
  }
});

// DELETE /api/orders/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await OrderModel.delete(id);
    if (!ok) return res.status(404).json({ error: "Order not found" });
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting order:", err);
    return res.status(500).json({ error: "Failed to delete order" });
  }
});

// POST /api/orders/import
router.post("/import", async (req, res) => {
  try {
    console.log("Import request body:", JSON.stringify(req.body, null, 2));

    const orders: ImportOrderData[] = Array.isArray(req.body?.orders)
      ? req.body.orders
      : [];

    console.log("Parsed orders array length:", orders.length);
    if (orders.length > 0) {
      console.log("Sample order:", JSON.stringify(orders[0], null, 2));
    }

    if (orders.length === 0)
      return res.status(400).json({ error: "Orders array is required" });

    const imported = await OrderModel.bulkImport(orders);

    console.log("Successfully imported:", imported.length, "orders");

    return res.status(201).json({
      imported: imported.length,
      orders: imported.map((order) => ({
        id: order.id,
        number: order.number,
        status: order.status,
        createdAt: order.created_at,
        items: (order.items || []).map((i) => ({
          productId: i.product_id,
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
        })),
      })),
    });
  } catch (err) {
    console.error("Error importing orders:", err);
    return res.status(500).json({ error: "Failed to import orders" });
  }
});

export default router;
