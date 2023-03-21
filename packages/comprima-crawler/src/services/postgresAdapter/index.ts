import knex from 'knex'
import config from '../../common/config'
import log from '../../common/log'

export interface LevelStatus {
  level: number
  error: string
  updated: Date
}

export interface Range {
  lower: number
  upper: number
}

export interface LevelRange {
  id: string
  lower: number
  upper: number
  statuses: LevelStatus[]
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

export const getUnindexedLevels = async (): Promise<{lower: number, upper: number}> => {
  // TODO: Get unindexed levels from postgres
  const [range] = await db
  .select('id', 'lower', 'upper')
  .from<LevelRange>('level_ranges')

  console.log(range)

  if (!range) {
    return Promise.reject('NO_UNINDEXED_LEVELS')
  }

  // TODO: Mark levels as in progress in postgres

  return Promise.resolve(range)
}
