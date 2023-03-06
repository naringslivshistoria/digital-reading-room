import jwt from 'jsonwebtoken'
import knex from 'knex'
import createHttpError from 'http-errors'

import hash from './hash'
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

const getUser = async (username : string) => {
  console.log('looking for', username)

  const [user] =  await db
    .select(
      'id',
      'username',
      'password_hash as passwordHash',
      'salt',
      'locked',
      'disabled',
      'failed_login_attempts as failedLoginAttempts'      
    )
    .from<User>('users')
    .where('username', username)

  console.log(user)

  return user
}

const setUserFailedLoginAttempts = async (
  userId: number,
  attempts: number
): Promise<void> => {
  await db('users')
    .where('id', userId)
    .update({ failed_login_attempts: attempts })
}

const setUserLocked = async (
  userId: number,
  locked: boolean
): Promise<void> => {
  await db('users').where('id', userId).update({ locked: locked })
}

export const createToken = async (
  username: string,
  password: string
) => {
  try {
    const user = await getUser(username)

    if (!user) {
      throw createHttpError(401, new Error(`Unknown user or invalid password.`))
    }

    if (user.locked === true) {
      throw createHttpError(403, new Error(`User locked: ${username}.`))
    }

    if (user.disabled === true) {
      throw createHttpError(403, new Error(`User disabled: ${username}.`))
    }

    if (user.passwordHash !== (await hash.hashPassword(password, user.salt))) {
      const fails = user.failedLoginAttempts + 1

      await setUserFailedLoginAttempts(user.id, fails)

      if (fails >= config.auth.maxFailedLoginAttempts) {
        await setUserLocked(user.id, true)
      }

      throw createHttpError(401, new Error(`Unknown user or invalid password.`))
    }

    // Clear failed login attempts
    await setUserFailedLoginAttempts(user.id, 0)

    // Welcome in, here is your token
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
      },
      config.auth.secret,
      {
        expiresIn: config.auth.expiresIn,
      }
    )

    return { token }
  } catch (error) {
    console.error(error)
    throw error
  }
}
