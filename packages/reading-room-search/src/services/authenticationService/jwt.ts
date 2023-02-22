import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import knex from 'knex'
import config from '../../common/config'

import hash from './hash'
import { User } from '../../common/types'

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

const { secret } = config.auth

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
      throw new Error(`No such user: ${username}.`)
    }

    if (user.locked === true) {
      throw new Error(`User locked: ${user.id}.`)
    }

    if (user.disabled === true) {
      throw new Error(`User disabled: ${user.id}.`)
    }

    if (user.passwordHash !== (await hash.hashPassword(password, user.salt))) {
      const fails = user.failedLoginAttempts + 1

      await setUserFailedLoginAttempts(user.id, fails)

      if (fails >= config.auth.maxFailedLoginAttempts) {
        await setUserLocked(user.id, true)
      }

      throw new Error(`Invalid password: ${user.id}.`)
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
    // How do we log this?
    console.error(error)
    const err = createHttpError('Invalid credentials')
    err.status = 401
    throw err
  }
}

/*export const refreshToken = async (token: UserTokenInfo): Promise<JWT> => {
  try {
    const { username } = token
    const user = await getUser(username)

    if (!user) {
      throw new Error(`No such user: ${username}.`)
    }

    if (user.locked === true) {
      throw new Error(`User locked: ${user.id}.`)
    }

    if (user.disabled === true) {
      throw new Error(`User disabled: ${user.id}.`)
    }

    // Welcome in, here is your token
    const freshToken = jwt.sign(
      {
        sub: user.id,
        username: user.username,
      },
      config.auth.secret,
      {
        expiresIn: config.auth.expiresIn,
      }
    )

    return { token: freshToken }
  } catch (error) {
    // How do we log this?
    console.error(error)
    const err = createHttpError('Invalid credentials')
    err.status = 401
    throw err
  }
}

export const authorize = ({ authorization }: any = {}) => {
  const authHeader: string | undefined = authorization

  try {
    if (authHeader) {
      const user:
        | string
        | {
            sub?: number
            username?: string
          } = jwt.verify(authHeader.replace('Bearer ', ''), secret)

      if (user && typeof user !== 'string' && user.sub) {
        return { auth: user }
      }
    }
  } catch (error) {
    error.status = 401
    throw error
  }

  const err = createHttpError('Unauthorized')
  err.status = 401
  throw err
}*/