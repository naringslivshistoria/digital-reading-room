import jwt from 'jsonwebtoken'
import knex from 'knex'
import createHttpError from 'http-errors'
import crypto from 'crypto'

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

const getUser = async (username: string) => {
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
      'reset_token',
      'reset_token_expires'
    )
    .from<User>('users')
    .where('username', username)

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

export const createToken = async (username: string, password: string) => {
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

    // Create token
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        depositors: user.depositors?.split(','),
        archiveInitiators: user.archiveInitiators?.split(','),
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

export const createResetToken = async (email: string) => {
  const user = await getUser(email)

  if (!user) {
    throw new Error('User not found')
  }

  const token = crypto.randomBytes(32).toString('hex')

  await db('users')
    .where({
      id: user.id,
    })
    .update({
      reset_token: token,
      reset_token_expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    })

  return token
}

export const setPassword = async (
  email: string,
  resetToken: string,
  salt: string,
  hash: string
) => {
  const user = await getUser(email)

  if (!user) {
    throw new Error('User not found')
  }

  if (!user['reset_token']) {
    throw new Error('No password reset token')
  }

  if (user['reset_token_epires'] && Date.now() > user['reset_token_expires']) {
    throw new Error('Password reset token has expired')
  }

  if (user['reset_token'] !== resetToken) {
    throw new Error('Invalid reset token')
  }

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
