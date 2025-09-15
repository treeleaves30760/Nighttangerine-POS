import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Enable uuid extension if using PostgreSQL
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  return knex.schema.createTable("products", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.string("category").notNullable();
    table.boolean("available").defaultTo(true);
    table.timestamps(true, true);

    table.index("category");
    table.index("available");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("products");
}
