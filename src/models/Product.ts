import knex from 'knex';
import config from '../config/database';

const db = knex(config[process.env['NODE_ENV'] as keyof typeof config] || config.development);

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateProductData {
  name: string;
  price: number;
  category: string;
  available?: boolean;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  category?: string;
  available?: boolean;
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
    return db('products').where({ available: true }).orderBy('category').orderBy('name');
  }

  static async create(data: CreateProductData): Promise<Product> {
    const [product] = await db('products')
      .insert({
        ...data,
        available: data.available ?? true,
      })
      .returning('*');
    return product;
  }

  static async update(id: string, data: UpdateProductData): Promise<Product | null> {
    const [product] = await db('products')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');
    return product || null;
  }

  static async delete(id: string): Promise<boolean> {
    const deletedRows = await db('products').where({ id }).del();
    return deletedRows > 0;
  }

  static async toggleAvailability(id: string): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) return null;

    return this.update(id, { available: !product.available });
  }
}

export default ProductModel;