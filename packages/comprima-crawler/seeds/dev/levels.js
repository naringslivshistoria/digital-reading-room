const fs = require('fs');
const { parse } = require('csv-parse');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const path = './seeds/dev/levels.csv';

  return new Promise((resolve, reject) => {
    let rows = [];
    return fs
      .createReadStream(path)
      .pipe(parse({ delimiter: ';', from_line: 2 }))
      .on('data', async ([depositor, archivist, level]) => {
        console.log('Row', depositor, archivist, level);

        rows.push({ depositor, archivist, level });
      })
      .on('end', function () {
        console.log('CSV file read. Inserting into database...');

        let inserts = [];
        rows.forEach((row) => {
          process.stdout.write('.');
          inserts.push(knex('levels').insert(row));
        });

        return Promise.all(inserts).then(() => {
          console.log('done!');
          return resolve();
        });
      })
      .on('error', function (error) {
        console.log(error.message);
        return reject(error);
      });
  });
};
