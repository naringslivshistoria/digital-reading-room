/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('level_ranges').insert([
    {
      lower: 41000,
      upper: 42000,
    },
  ]);
};
