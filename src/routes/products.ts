import express, { Router } from "express";
import ProductModel, { Product, UpdateProductData } from "../models/Product";

const router: Router = express.Router();

const DATA_URI_REGEX = /^data:([a-z0-9.+\-\/]+);base64,(.+)$/i;
const DEFAULT_IMAGE_MIME = "application/octet-stream";

interface ImageRequest {
  base64Provided: boolean;
  buffer: Buffer | null;
  mimeType: string | null;
  removeImage: boolean;
  urlProvided: boolean;
  url: string | null;
}

const decodeBase64Image = (
  raw: string,
  fallbackMime: unknown,
): { buffer: Buffer; mimeType: string } => {
  const trimmed = raw.trim();
  const match = trimmed.match(DATA_URI_REGEX);
  let mimeType =
    typeof fallbackMime === "string" && fallbackMime.trim()
      ? fallbackMime.trim()
      : null;
  let payload = trimmed;

  if (match) {
    mimeType = match[1] ?? mimeType;
    payload = match[2] ?? "";
  }

  try {
    const buffer = Buffer.from(payload, "base64");
    if (!buffer.length) {
      throw new Error("Empty buffer");
    }
    return {
      buffer,
      mimeType: mimeType ?? DEFAULT_IMAGE_MIME,
    };
  } catch (error) {
    throw new Error("Invalid base64 image data");
  }
};

const extractImageRequest = (body: any): ImageRequest => {
  const result: ImageRequest = {
    base64Provided: false,
    buffer: null,
    mimeType: null,
    removeImage: false,
    urlProvided: false,
    url: null,
  };

  const rawBase64 = body?.image_base64 ?? body?.imageBase64;
  if (rawBase64 !== undefined) {
    result.base64Provided = true;
    if (rawBase64 === null) {
      result.removeImage = true;
    } else if (typeof rawBase64 === "string") {
      const trimmed = rawBase64.trim();
      if (!trimmed) {
        result.removeImage = true;
      } else {
        const rawMime = body?.image_mime_type ?? body?.imageMimeType;
        const { buffer, mimeType } = decodeBase64Image(trimmed, rawMime);
        result.buffer = buffer;
        result.mimeType = mimeType;
      }
    } else {
      throw new Error(
        "image_base64 must be a base64-encoded string, null, or omitted",
      );
    }
  }

  const rawUrl = body?.image_url ?? body?.imageUrl;
  if (rawUrl !== undefined) {
    result.urlProvided = true;
    if (rawUrl === null) {
      result.url = null;
    } else if (typeof rawUrl === "string") {
      const trimmed = rawUrl.trim();
      result.url = trimmed || null;
    } else {
      throw new Error("image_url must be a string, null, or omitted");
    }
  }

  return result;
};

const serializeProduct = (product: Product) => {
  const {
    image_data: imageData,
    image_mime_type: imageMime,
    image_url: rawImageUrl,
    ...rest
  } = product;

  let imageUrl = rawImageUrl ?? null;

  if (!imageUrl && imageData) {
    const base64 = imageData.toString("base64");
    const mime = imageMime ?? DEFAULT_IMAGE_MIME;
    imageUrl = `data:${mime};base64,${base64}`;
  }

  return {
    ...rest,
    image_url: imageUrl,
    has_image: Boolean(imageData),
  };
};

const serializeProducts = (products: Product[]) =>
  products.map((product) => serializeProduct(product));

const toBoolean = (value: unknown, defaultValue: boolean): boolean => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return defaultValue;
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  }
  return defaultValue;
};

// GET /api/products - Get all products
router.get("/", async (_req, res) => {
  try {
    const products = await ProductModel.findAll();
    return res.json(serializeProducts(products));
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      error: "Failed to fetch products",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/products/available - Get only available products
router.get("/available", async (_req, res) => {
  try {
    const products = await ProductModel.findAvailable();
    return res.json(serializeProducts(products));
  } catch (error) {
    console.error("Error fetching available products:", error);
    return res.status(500).json({
      error: "Failed to fetch available products",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(serializeProduct(product));
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      error: "Failed to fetch product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/products/category/:category - Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await ProductModel.findByCategory(category);
    return res.json(serializeProducts(products));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({
      error: "Failed to fetch products by category",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/products - Create new product
router.post("/", async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      amount = null,
      hidden = false,
      available = true,
    } = req.body as Record<string, unknown>;

    if (!name || !price || !category) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Name, price, and category are required",
      });
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        error: "Invalid price",
        message: "Price must be greater than 0",
      });
    }

    let imageRequest: ImageRequest;
    try {
      imageRequest = extractImageRequest(req.body);
    } catch (parseError) {
      return res.status(400).json({
        error: "Invalid image payload",
        message:
          parseError instanceof Error
            ? parseError.message
            : "Invalid image payload",
      });
    }

    const hiddenFlag = toBoolean(hidden, false);
    const availableFlag = toBoolean(available, true);

    const product = await ProductModel.create({
      name: String(name).trim(),
      price: numericPrice,
      category: String(category).trim(),
      amount: amount ? String(amount).trim() : null,
      hidden: hiddenFlag,
      available: availableFlag,
      image_url:
        imageRequest.base64Provided && !imageRequest.removeImage
          ? null
          : imageRequest.url,
      image_data:
        imageRequest.base64Provided && !imageRequest.removeImage
          ? imageRequest.buffer
          : null,
      image_mime_type:
        imageRequest.base64Provided && !imageRequest.removeImage
          ? imageRequest.mimeType ?? DEFAULT_IMAGE_MIME
          : null,
    });

    return res.status(201).json(serializeProduct(product));
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      error: "Failed to create product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PUT /api/products/:id - Update product
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as any;
    let imageRequest: ImageRequest;
    try {
      imageRequest = extractImageRequest(body);
    } catch (parseError) {
      return res.status(400).json({
        error: "Invalid image payload",
        message:
          parseError instanceof Error
            ? parseError.message
            : "Invalid image payload",
      });
    }

    const updates: UpdateProductData = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return res.status(400).json({
          error: "Invalid name",
          message: "Name must be a non-empty string",
        });
      }
      updates.name = body.name.trim();
    }

    if (body.category !== undefined) {
      if (typeof body.category !== "string" || !body.category.trim()) {
        return res.status(400).json({
          error: "Invalid category",
          message: "Category must be a non-empty string",
        });
      }
      updates.category = body.category.trim();
    }

    if (body.price !== undefined) {
      const numericPrice = Number(body.price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({
          error: "Invalid price",
          message: "Price must be greater than 0",
        });
      }
      updates.price = numericPrice;
    }

    if (body.amount !== undefined) {
      if (body.amount === null) {
        updates.amount = null;
      } else {
        const value = String(body.amount).trim();
        updates.amount = value || null;
      }
    }

    if (body.hidden !== undefined) {
      updates.hidden = toBoolean(body.hidden, false);
    }

    if (body.available !== undefined) {
      updates.available = toBoolean(body.available, true);
    }

    if (imageRequest.base64Provided) {
      if (imageRequest.removeImage) {
        updates.image_data = null;
        updates.image_mime_type = null;
        updates.image_url = null;
      } else {
        updates.image_data = imageRequest.buffer;
        updates.image_mime_type = imageRequest.mimeType ?? DEFAULT_IMAGE_MIME;
        updates.image_url = null;
      }
    } else if (imageRequest.urlProvided) {
      updates.image_url = imageRequest.url;
      updates.image_data = null;
      updates.image_mime_type = null;
    }

    const product = await ProductModel.update(id, updates);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(serializeProduct(product));
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      error: "Failed to update product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PATCH /api/products/:id/availability - Toggle product availability
router.patch("/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.toggleAvailability(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(serializeProduct(product));
  } catch (error) {
    console.error("Error toggling product availability:", error);
    return res.status(500).json({
      error: "Failed to toggle product availability",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting products referenced by order_items
    const hasRefs = await ProductModel.hasOrderReferences(id);
    if (hasRefs) {
      return res.status(409).json({
        error: "Product has order history",
        message:
          "This product appears in one or more orders and cannot be deleted. Hide it instead.",
      });
    }

    const deleted = await ProductModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting product:", error);
    // Handle FK violation fallback
    if (
      error &&
      typeof error === "object" &&
      (error.code === "23503" || /foreign key/i.test(error.message || ""))
    ) {
      return res.status(409).json({
        error: "Product has order history",
        message:
          "This product appears in one or more orders and cannot be deleted. Hide it instead.",
      });
    }
    return res.status(500).json({
      error: "Failed to delete product",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
