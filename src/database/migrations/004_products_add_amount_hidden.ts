import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('products', (table) => {
    table.string('amount').nullable();
    table.boolean('hidden').notNullable().defaultTo(false);
    table.index(['hidden']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('products', (table) => {
    table.dropIndex(['hidden']);
    table.dropColumn('hidden');
    table.dropColumn('amount');
  });
}

