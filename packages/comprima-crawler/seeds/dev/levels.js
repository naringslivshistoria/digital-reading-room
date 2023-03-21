const fs = require('fs');
const { parse } = require('csv-parse');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const path = './seeds/dev/levels.csv';

  return new Promise((resolve, reject) => {
    return fs
      .createReadStream(path)
      .pipe(parse({ delimiter: ';', from_line: 2 }))
      .on('data', async ([depositor, archivist, level]) => {
        await knex('levels').insert({
          archivist,
          depositor,
          level,
        });
      })
      .on('end', function () {
        return resolve('ok');
      })
      .on('error', function (error) {
        console.log(error.message);
      });
  });
};
