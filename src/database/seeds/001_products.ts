import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('products').del();

  // Inserts seed entries (let database generate UUIDs)
  await knex('products').insert([
    {
      name: 'Cappuccino',
      price: 4.50,
      category: 'Beverages',
      available: true,
    },
    {
      name: 'Espresso',
      price: 2.50,
      category: 'Beverages',
      available: true,
    },
    {
      name: 'Green Tea',
      price: 3.00,
      category: 'Beverages',
      available: true,
    },
    {
      name: 'Iced Coffee',
      price: 3.75,
      category: 'Beverages',
      available: false,
    },
    {
      name: 'Caesar Salad',
      price: 12.99,
      category: 'Food',
      available: true,
    },
    {
      name: 'Club Sandwich',
      price: 9.50,
      category: 'Food',
      available: true,
    },
    {
      name: 'Soup of the Day',
      price: 6.75,
      category: 'Food',
      available: true,
    },
    {
      name: 'Croissant',
      price: 3.25,
      category: 'Bakery',
      available: true,
    },
    {
      name: 'Chocolate Muffin',
      price: 4.75,
      category: 'Bakery',
      available: true,
    },
    {
      name: 'Danish Pastry',
      price: 4.25,
      category: 'Bakery',
      available: false,
    },
  ]);
}
