/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex('users').where('username', 'dev-team').update({ depositors: 'Centrum för Näringslivshistoria' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex('users').where('username', 'dev-team').update({ depositors: null });
};
