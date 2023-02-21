/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('users').insert([
    {
      username: 'cfn',
      salt: '/jt9pl0wnes4P+Xv',
      password_hash: 'Kyavgib9c92Vimtl6y9QAfE7YprZ2e5i2OEKz1H0QaexatsEPoh8ZCwh2MawgRJjeR4l2PXLHT9zqh5D',
    },
  ]);
};
