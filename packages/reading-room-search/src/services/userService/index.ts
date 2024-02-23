import KoaRouter from '@koa/router'

import createHttpError from 'http-errors'
import { sendEmail } from '../../common/adapters/smtpAdapter'
import { createUser } from '../../common/adapters/userAdapter'
import { User } from '../../common/types'

export const routes = (router: KoaRouter) => {}
