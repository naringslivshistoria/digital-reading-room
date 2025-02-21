import knex from 'knex'
import { User } from '../../common/types'
import config from '../../common/config'

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

export const createUser = async (user: User): Promise<void> => {
  try {
    await db('users').insert(user)
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error
    }
    console.error('Error creating user', error.message)
    if (/duplicate key value violates unique constraint/.test(error.message)) {
      throw new Error(`Username is already in use`)
    } else {
      throw new Error('Error creating user')
    }
  }
}

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
      'depositors',
      'archiveInitiators',
      'documentIds',
      'fileNames',
      'series',
      'volumes',
      'reset_token',
      'reset_token_expires',
      'firstName',
      'lastName',
      'organization',
      'verification_token',
      'verification_token_expires'
    )
    .from<User>('users')
    .where('username', username)

  return user
}

export const getUserData = async (username: string): Promise<Partial<User>> => {
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
      'disabled'
    )
    .from<User>('users')
    .where('username', username)
  return userData
}

export const updateUserFailedLoginAttempts = async (
  userId: number,
  attempts: number
): Promise<void> => {
  await db('users')
    .where('id', userId)
    .update({ failed_login_attempts: attempts })
}

export const updateUserLocked = async (
  userId: number,
  locked: boolean
): Promise<void> => {
  await db('users').where('id', userId).update({ locked: locked })
}

export const updateResetToken = async (
  user: User,
  token: string
): Promise<void> => {
  await db('users')
    .where({
      id: user.id,
    })
    .update({
      reset_token: token,
      reset_token_expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    })
}
export const updatePassword = async (
  user: User,
  salt: string,
  hash: string
): Promise<void> => {
  await db('users')
    .where({
      id: user.id,
    })
    .update({
      salt,
      password_hash: hash,
      reset_token: null,
      reset_token_expires: null,
    })
}
