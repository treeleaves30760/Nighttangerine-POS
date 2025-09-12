import knex from 'knex';
import config from '../config/database';

const db = knex(config[process.env['NODE_ENV'] as keyof typeof config] || config.development);

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean; // legacy field; prefer hidden=false
  amount?: string | null;
  hidden?: boolean;
  image_url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateProductData {
  name: string;
  price: number;
  category: string;
  amount?: string | null;
  hidden?: boolean;
  available?: boolean; // legacy
  image_url?: string | null;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  category?: string;
  amount?: string | null;
  hidden?: boolean;
  available?: boolean; // legacy
  image_url?: string | null;
}

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    return db('products').select('*').orderBy('category').orderBy('name');
  }

  static async findById(id: string): Promise<Product | undefined> {
    return db('products').where({ id }).first();
  }

  static async findByCategory(category: string): Promise<Product[]> {
    return db('products').where({ category }).orderBy('name');
  }

  static async findAvailable(): Promise<Product[]> {
    // Treat hidden=false as available; keep compatibility with existing endpoint
    return db('products').where({ hidden: false }).orderBy('category').orderBy('name');
  }

  static async create(data: CreateProductData): Promise<Product> {
    const [product] = await db('products')
      .insert({
        name: data.name,
        price: data.price,
        category: data.category,
        amount: data.amount ?? null,
        hidden: data.hidden ?? false,
        available: data.available ?? true,
        image_url: data.image_url ?? null,
      })
      .returning('*');
    return product;
  }

  static async update(id: string, data: UpdateProductData): Promise<Product | null> {
    const updates: Record<string, any> = {
      updated_at: new Date(),
    };
    if (data.name !== undefined) updates['name'] = data.name;
    if (data.price !== undefined) updates['price'] = data.price;
    if (data.category !== undefined) updates['category'] = data.category;
    if (data.amount !== undefined) updates['amount'] = data.amount;
    if (data.hidden !== undefined) updates['hidden'] = data.hidden;
    if (data.available !== undefined) updates['available'] = data.available;
    if (data.image_url !== undefined) updates['image_url'] = data.image_url;

    const [product] = await db('products').where({ id }).update(updates).returning('*');
    return product || null;
  }

  static async delete(id: string): Promise<boolean> {
    const deletedRows = await db('products').where({ id }).del();
    return deletedRows > 0;
  }

  static async hasOrderReferences(id: string): Promise<boolean> {
    const ref = await db('order_items').where({ product_id: id }).first();
    return Boolean(ref);
  }

  static async toggleAvailability(id: string): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) return null;
    const currentHidden = Boolean(product.hidden);
    return this.update(id, { hidden: !currentHidden });
  }
}

export default ProductModel;
