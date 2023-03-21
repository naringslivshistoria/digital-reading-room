import knex from 'knex'
import config from '../../common/config'
import log from '../../common/log'

export interface Level {
  id: string
  level: number

  archivist: string
  depositor: string
  created: Date

  crawled?: Date
  indexed?: Date
  error?: string
}

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
})

export const getUnindexedLevels = async (): Promise<Level> => {
  // TODO: Get unindexed levels from postgres
  const [level] = await db
  .select
  (
    'id',
    'level',
    'archivist',
    'crawled',
    'depositor',
    'created',
    'indexed',
    'error'
    )
  .from<Level>('levels')
  .limit(1)
  .where('indexed', null)
  .where('result', null)

  console.log(level)

  if (!level) {
    return Promise.reject('NO_UNINDEXED_LEVELS')
  }

  // TODO: Mark levels as in progress in postgres

  return Promise.resolve(level)
}
