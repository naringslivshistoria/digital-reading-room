// Login logic copied from reading-room-search (createToken).
import jwt from 'jsonwebtoken'
import createHttpError from 'http-errors'
import { timingSafeEqual } from 'crypto'

import hash from './hash'
import {
  getUser,
  updateUserFailedLoginAttempts,
  updateUserLocked,
} from '../../common/adapters/userAdapter'
import config from '../../common/config'
import { hasPlatformAccess } from '../../common/platformAccess'

const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export const createToken = async (username: string, password: string) => {
  const user = await getUser(username)

  if (!user) {
    throw createHttpError(401, 'Unknown user or invalid password.')
  }

  if (user.locked === true) {
    throw createHttpError(403, 'User locked.')
  }

  if (user.disabled === true) {
    throw createHttpError(403, 'User disabled.')
  }

  const passwordHash = await hash.hashPassword(password, user.salt)
  if (!safeEqual(user.passwordHash, passwordHash)) {
    const fails = user.failedLoginAttempts + 1

    await updateUserFailedLoginAttempts(user.id, fails)

    if (fails >= config.auth.maxFailedLoginAttempts) {
      await updateUserLocked(user.id, true)
    }

    throw createHttpError(401, 'Unknown user or invalid password.')
  }

  await updateUserFailedLoginAttempts(user.id, 0)

  if (!hasPlatformAccess(user.platforms)) {
    throw createHttpError(403, 'No access to Företagskällan.')
  }

  return jwt.sign(
    { sub: user.id, username: user.username },
    config.auth.secret,
    { expiresIn: config.auth.expiresIn }
  )
}
