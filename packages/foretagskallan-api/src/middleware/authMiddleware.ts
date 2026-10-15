// Same behaviour as reading-room-search: access rights are read from the database on every
// request, not from the token, so changes in backoffice take effect at once (with a 60 s cache).
import { Context, Next } from 'koa'

import { fetchUserData } from '../services/userService'
import { hasPlatformAccess } from '../common/platformAccess'

export const populateUserState = async (ctx: Context, next: Next) => {
  if (!ctx.state.user?.username) {
    ctx.status = 401
    return
  }

  let userData
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
    ctx.body = { error: 'No access to Företagskällan' }
    return
  }

  ctx.state.user = { ...ctx.state.user, ...userData }
  await next()
}
