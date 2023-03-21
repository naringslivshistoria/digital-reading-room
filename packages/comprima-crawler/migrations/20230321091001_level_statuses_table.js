/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('level_statuses', (table) => {
    table
      .uuid('id')
      .primary()
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('level_range_id')
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.integer('level').notNullable();
    table.timestamp('updated').defaultTo(knex.fn.now());
    table.string('error', 1024).nullable();
    table.unique(['level_range_id', 'level']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('level_statuses');
};
