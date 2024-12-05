import { Context, Next } from 'koa'

export const populateUserStateFromSession = async (
  ctx: Context,
  next: Next
) => {
  if (ctx.session && ctx.session.user) {
    ctx.state.user = ctx.session.user
  } else {
    ctx.state.user = {}
  }
  await next()
}
