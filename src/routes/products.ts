import express, { Router } from 'express';
import ProductModel, { UpdateProductData } from '../models/Product';

const router: Router = express.Router();

// GET /api/products - Get all products
router.get('/', async (_req, res) => {
  try {
    const products = await ProductModel.findAll();
    return res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/available - Get only available products
router.get('/available', async (_req, res) => {
  try {
    const products = await ProductModel.findAvailable();
    return res.json(products);
  } catch (error) {
    console.error('Error fetching available products:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch available products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await ProductModel.findByCategory(category);
    return res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch products by category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, category, amount = null, hidden = false, available = true } = req.body as any;
    // Support both imageUrl (camelCase) and image_url (snake_case)
    const imageUrlInput: string | null = (req.body?.image_url ?? req.body?.imageUrl ?? null) || null;
    
    if (!name || !price || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, price, and category are required'
      });
    }

    if (price <= 0) {
      return res.status(400).json({ 
        error: 'Invalid price',
        message: 'Price must be greater than 0'
      });
    }

    const product = await ProductModel.create({
      name: name.trim(),
      price: parseFloat(price.toString()),
      category: category.trim(),
      amount: amount ? String(amount).trim() : null,
      hidden: Boolean(hidden),
      available,
      image_url: imageUrlInput ? String(imageUrlInput).trim() : null,
    });
    
    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ 
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateProductData = req.body;
    if ('imageUrl' in updates && !('image_url' in updates)) {
      // normalize camelCase to snake_case
      (updates as any).image_url = (updates as any).imageUrl;
      delete (updates as any).imageUrl;
    }

    if (updates.price !== undefined && updates.price <= 0) {
      return res.status(400).json({ 
        error: 'Invalid price',
        message: 'Price must be greater than 0'
      });
    }

    // Trim string fields
    if (updates.name) updates.name = updates.name.trim();
    if (updates.category) updates.category = updates.category.trim();
    if (updates.price !== undefined) updates.price = parseFloat(updates.price.toString());

    const product = await ProductModel.update(id, updates);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ 
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PATCH /api/products/:id/availability - Toggle product availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.toggleAvailability(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.json(product);
  } catch (error) {
    console.error('Error toggling product availability:', error);
    return res.status(500).json({ 
      error: 'Failed to toggle product availability',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting products referenced by order_items
    const hasRefs = await ProductModel.hasOrderReferences(id);
    if (hasRefs) {
      return res.status(409).json({
        error: 'Product has order history',
        message: 'This product appears in one or more orders and cannot be deleted. Hide it instead.',
      });
    }

    const deleted = await ProductModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting product:', error);
    // Handle FK violation fallback
    if (error && typeof error === 'object' && (error.code === '23503' || /foreign key/i.test(error.message || ''))) {
      return res.status(409).json({
        error: 'Product has order history',
        message: 'This product appears in one or more orders and cannot be deleted. Hide it instead.',
      });
    }
    return res.status(500).json({ 
      error: 'Failed to delete product',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
