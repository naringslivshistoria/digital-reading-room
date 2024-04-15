/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('levels', function (t) {
    try {
      t.dropUnique([], 'levels_level_unique')
    } catch (error) {
      console.log('Already deleted')
    }
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('levels', function (t) {
    t.unique(['level'])
  })
}
