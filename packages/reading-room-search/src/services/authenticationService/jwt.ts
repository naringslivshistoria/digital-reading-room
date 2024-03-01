import jwt from 'jsonwebtoken'
import createHttpError from 'http-errors'
import crypto from 'crypto'

import hash from './hash'
import {
  getUser,
  updateResetToken,
  updateUserFailedLoginAttempts,
  updateUserLocked,
  updatePassword,
} from '../../common/adapters/userAdapter'
import config from '../../common/config'

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

      await updateUserFailedLoginAttempts(user.id, fails)

      if (fails >= config.auth.maxFailedLoginAttempts) {
        await updateUserLocked(user.id, true)
      }

      throw createHttpError(401, new Error(`Unknown user or invalid password.`))
    }

    // Clear failed login attempts
    await updateUserFailedLoginAttempts(user.id, 0)

    // Create token
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        depositors: user.depositors?.split(';'),
        archiveInitiators: user.archiveInitiators?.split(';'),
        fileNames: user.fileNames?.split(';'),
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
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

  updateResetToken(user, token)

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

  updatePassword(user, salt, hash)
}
