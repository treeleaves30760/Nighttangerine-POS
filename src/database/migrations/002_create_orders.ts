import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.createTable("orders", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.integer("number").notNullable().unique();
    table
      .enu("status", ["pending", "preparing", "finished"], {
        useNative: true,
        enumName: "order_status",
      })
      .notNullable()
      .defaultTo("preparing");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("order_items", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("order_id")
      .notNullable()
      .references("orders.id")
      .onDelete("CASCADE");
    table.uuid("product_id").notNullable().references("products.id");
    // Snapshot product name & price at purchase time
    table.string("name").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.integer("quantity").notNullable().defaultTo(1);
  });

  // Helper function for ordering
  await knex.schema.alterTable("orders", (table) => {
    table.index(["status"]);
    table.index(["created_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("order_items");
  await knex.schema.dropTableIfExists("orders");
  await knex.raw("DROP TYPE IF EXISTS order_status");
}
