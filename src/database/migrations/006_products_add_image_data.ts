import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("products", (table) => {
    table.binary("image_data").nullable();
    table.string("image_mime_type", 255).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("image_data");
    table.dropColumn("image_mime_type");
  });
}
