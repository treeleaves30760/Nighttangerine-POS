import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.boolean('hidden').notNullable().defaultTo(false);
    table.index(['hidden']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.dropIndex(['hidden']);
    table.dropColumn('hidden');
  });
}

