import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add 'completed' to the order_status enum
  await knex.raw(`
    ALTER TYPE order_status ADD VALUE 'completed';
  `);

  // Add hidden column to orders table if it doesn't exist
  const hasHiddenColumn = await knex.schema.hasColumn('orders', 'hidden');
  if (!hasHiddenColumn) {
    await knex.schema.alterTable('orders', (table) => {
      table.boolean('hidden').defaultTo(false);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Note: PostgreSQL doesn't support removing values from enums directly
  // In a real scenario, you would need to:
  // 1. Create a new enum without 'completed'
  // 2. Alter the table to use the new enum
  // 3. Drop the old enum
  // For simplicity, we'll just remove the hidden column

  const hasHiddenColumn = await knex.schema.hasColumn('orders', 'hidden');
  if (hasHiddenColumn) {
    await knex.schema.alterTable('orders', (table) => {
      table.dropColumn('hidden');
    });
  }
}