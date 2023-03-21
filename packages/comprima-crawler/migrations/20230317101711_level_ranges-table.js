/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.createTable('level_ranges', (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      table.integer('lower').notNullable().defaultTo(0);
      table.integer('upper').notNullable().defaultTo(0);
      table.boolean('in_progress').notNullable().defaultTo(false);
      table.timestamp('created').defaultTo(knex.fn.now());
      table.timestamp('indexed').defaultTo(null);
      table.unique(['lower', 'upper']);
    })
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('level_ranges');
};
