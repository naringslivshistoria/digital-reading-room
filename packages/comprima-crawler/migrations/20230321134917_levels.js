/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.createTable('levels', (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      table.integer('level').notNullable();

      // Metadata.
      table.string('archivist').notNullable();
      table.string('depositor').notNullable();
      table.timestamp('created').notNullable().defaultTo(knex.fn.now());

      // State.
      table.timestamp('crawled').nullable();
      table.json('error').nullable();
      table.json('result').nullable();

      // Constraints/Indices.
      table.unique(['level']);
    })
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('levels');
};
