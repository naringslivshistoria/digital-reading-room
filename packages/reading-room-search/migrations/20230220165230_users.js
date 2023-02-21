/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
  knex.schema.createTable('users', (table) => {
    table
      .uuid('id')
      .primary()
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('username', 128).notNullable()
    table.string('salt', 20).notNullable()
    table.string('password_hash', 128).notNullable()
    table.boolean('locked').notNullable().defaultTo(false)
    table.boolean('disabled').notNullable().defaultTo(false)
    table.integer('failed_login_attempts').notNullable().defaultTo(0)
    table.timestamp('created').defaultTo(knex.fn.now())
    table.unique('username')
  })) 
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users')
}
