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
  error?: string

  failed: number
  successful: number
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

export const getUnindexedLevel = async (): Promise<Level> => {
  try {
    const [level] = await db
    .select
    (
      'id',
      'level',
      'archivist',
      'crawled',
      'depositor',
      'created',
      'error',
      'failed',
      'successful',
      )
    .from<Level>('levels')
    .limit(1)
    .where('crawled', null)
    .where('error', null)

    if (!level) {
      return Promise.reject('NO_UNINDEXED_LEVELS')
    }

    return Promise.resolve(level)
  } catch (error: any) {
    log.error('Unable to get unindexed levels', error)
    return Promise.reject(error)
  }
}

export const updateLevel = async (level: Level): Promise<boolean> => {
  try {
    await db
    .update(level)
    .from<Level>('levels')
    .where('id', level.id)

    return Promise.resolve(true)
  } catch (error: any) {
    log.error('Unable to update level', error)
    return Promise.reject(error)
  }
}