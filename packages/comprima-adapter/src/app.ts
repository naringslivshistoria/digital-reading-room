import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
//import pinoLogger from 'koa-pino-logger'

import exampleApi from './api'
import errorHandler from './middlewares/error-handler'

const app = new Koa()
/*const logger = pinoLogger()

app.use(logger)*/

app.use(errorHandler())

app.use(bodyParser())
app.use(exampleApi.routes())

export default app
