import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'

import api from './api'
import errorHandler from './middlewares/error-handler'

const app = new Koa()

app.use(cors())

app.use(errorHandler())

app.use(bodyParser())
app.use(api.routes())

export default app
