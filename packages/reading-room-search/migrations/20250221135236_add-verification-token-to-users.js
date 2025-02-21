/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.text('verification_token')
    table.dateTime('verification_token_expires')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('verification_token')
    table.dropColumn('verification_token_expires')
  })
}
