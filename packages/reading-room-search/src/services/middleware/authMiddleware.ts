import { Context, Next } from 'koa'

import { fetchUserData } from '../userService'
import { User } from '../../common/types'

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

  ctx.state.user = { ...ctx.state.user, ...userData }
  await next()
}
