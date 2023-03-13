/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex('users').insert({
    username: 'dev-team',
    salt: 'XuzNhWih8IKem8b9',
    password_hash:
      'W1vtQI/Yvre1QVocWrED+4BT7OSB4rPA+MuoKQpz5yOn6gwxO+TRoQ0eMJRodlf0TVCLVK8m4QlApT5+',
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('users').where('username', 'dev-team').del();
};
