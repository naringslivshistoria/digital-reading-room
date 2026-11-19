import { Context, Next } from 'koa'

import { fetchUserData } from '../userService'
import { User } from '../../common/types'
import { hasPlatformAccess } from '../../common/platformAccess'

export const populateUserState = async (ctx: Context, next: Next) => {
  if (!ctx.state.user?.username) {
    ctx.status = 401
    return
  }

  let userData: Partial<User> | null = null
  try {
    userData = await fetchUserData(ctx.state.user.username)
  } catch (error) {
    console.error('Error fetching user data:', error)
    ctx.status = 500
    ctx.body = { error: 'Internal server error' }
    return
  }

  if (!userData) {
    ctx.status = 401
    return
  }

  if (userData.locked || userData.disabled) {
    ctx.status = 401
    ctx.body = {
      error: `User is ${userData.locked ? 'locked' : 'disabled'}`,
    }
    return
  }

  if (!hasPlatformAccess(userData.platforms)) {
    ctx.status = 403
    ctx.body = { error: 'No access to the reading room' }
    return
  }

  ctx.state.user = { ...ctx.state.user, ...userData }
  await next()
}
