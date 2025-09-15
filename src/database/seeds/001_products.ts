import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Clean dependent tables first to satisfy FKs if any prior data exists
  const hasOrderItems = await knex.schema.hasTable("order_items");
  if (hasOrderItems) {
    await knex("order_items").del();
  }

  // Deletes ALL existing product entries
  await knex("products").del();

  // Inserts seed entries (let database generate UUIDs)
  await knex("products").insert([
    {
      name: "醬燒雞肉串",
      price: 50,
      category: "Food",
      amount: "3串",
      hidden: false,
      available: true,
    },
    {
      name: "培根金針菇",
      price: 50,
      category: "Food",
      amount: "3個",
      hidden: false,
      available: true,
    },
    {
      name: "培根玉米筍",
      price: 50,
      category: "Food",
      amount: "3個",
      hidden: false,
      available: true,
    },
    {
      name: "培根青椒串",
      price: 50,
      category: "Food",
      amount: "3個",
      hidden: false,
      available: true,
    },
    {
      name: "蒜香香腸",
      price: 40,
      category: "Food",
      amount: "1支",
      hidden: false,
      available: true,
    },
    {
      name: "和風蟹肉丸",
      price: 50,
      category: "Food",
      amount: "6顆",
      hidden: false,
      available: true,
    },
    {
      name: "瑪格小披薩",
      price: 40,
      category: "Food",
      amount: "2個",
      hidden: false,
      available: true,
    },
  ]);
}
