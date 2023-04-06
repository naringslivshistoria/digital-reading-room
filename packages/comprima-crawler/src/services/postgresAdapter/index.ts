import knex from 'knex';
import config from '../../common/config';
import log from '../../common/log';
import { Level } from '../../common/types';

const db = knex({
  client: 'pg',
  connection: {
    host: config.postgres.host,
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
    port: config.postgres.port,
    timezone: 'UTC',
    dateStrings: true,
  },
});

export const getUnindexedLevel = async (): Promise<Level> => {
  try {
    let [level] = await db
      .select(
        'id',
        'level',
        'archivist',
        'crawled',
        'depositor',
        'created',
        'failed',
        'successful'
      )
      .from<Level>('levels')
      .limit(1)
      .where('crawled', null);

    if (!level) {
      [level] = await db
        .select(
          'id',
          'level',
          'archivist',
          'crawled',
          'depositor',
          'created',
          'failed',
          'successful'
        )
        .from<Level>('levels')
        .limit(1)
        .where('error', 'is not', null)
        .orderBy('crawled', 'asc');
    }

    if (!level) {
      return Promise.reject('NO_UNINDEXED_LEVELS');
    }

    return Promise.resolve(level);
  } catch (error) {
    if (error) {
      log.error('Unable to get unindexed levels', error);
    }

    return Promise.reject(error);
  }
};

export const updateLevel = async (level: Level): Promise<boolean> => {
  try {
    await db.update(level).from<Level>('levels').where('id', level.id);

    return Promise.resolve(true);
  } catch (error) {
    if (error) {
      log.error('Unable to update level', error);
    }
    return Promise.reject(error);
  }
};
