// Copied subset of reading-room-search/src/common/adapters/userAdapter.ts.
// The packages in the repo are standalone (own Docker context in CI), so code can't be imported between them.
import knex from 'knex'
import { User } from '../types'
import config from '../config'

const db = knex({
  client: 'pg',
  connection: {
    host: config.postgres.host,
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
    port: config.postgres.port,
  },
})

// Platforms the user has access to (table user_platforms, migration in reading-room-search).
const platformsColumn = () =>
  db.raw(
    `coalesce((select json_agg(up.platform order by up.platform) from user_platforms up where up.user_id = users.id), '[]'::json) as platforms`
  )

export const getUser = async (username: string) => {
  const [user] = await db
    .select(
      'id',
      'username',
      'password_hash as passwordHash',
      'salt',
      'locked',
      'disabled',
      'failed_login_attempts as failedLoginAttempts',
      platformsColumn()
    )
    .from('users')
    .where('username', username)

  return user as
    | Pick<
        User,
        | 'id'
        | 'username'
        | 'passwordHash'
        | 'salt'
        | 'locked'
        | 'disabled'
        | 'failedLoginAttempts'
        | 'platforms'
      >
    | undefined
}

// The access fields are stored as semicolon-separated strings in the database.
export const getUserData = async (username: string) => {
  const [userData] = await db
    .select(
      'firstName',
      'lastName',
      'organization',
      'depositors',
      'archiveInitiators',
      'documentIds',
      'fileNames',
      'series',
      'volumes',
      'locked',
      'disabled',
      platformsColumn()
    )
    .from('users')
    .where('username', username)

  return userData as
    | Record<string, string | boolean | string[] | null>
    | undefined
}

export const updateUserFailedLoginAttempts = async (
  userId: string,
  attempts: number
): Promise<void> => {
  await db('users')
    .where('id', userId)
    .update({ failed_login_attempts: attempts })
}

export const updateUserLocked = async (
  userId: string,
  locked: boolean
): Promise<void> => {
  await db('users').where('id', userId).update({ locked })
}

export const ping = async () => {
  await db.raw('select 1')
}
