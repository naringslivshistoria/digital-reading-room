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
      table.integer('from').notNullable().defaultTo(0);
      table.integer('to').notNullable().defaultTo(0);
      table.boolean('in_progress').notNullable().defaultTo(false);
      table.timestamp('created').defaultTo(knex.fn.now());
      table.timestamp('indexed').defaultTo(null);
      table.unique(['from', 'to']);
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
