/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('level_ranges').insert([
    {
      from: 41000,
      to: 42000,
    },
  ]);
};
