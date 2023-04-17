import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import exampleApi from './api'
import errorHandler from './middlewares/error-handler'

const app = new Koa()

app.use(errorHandler())

app.use(bodyParser())
app.use(exampleApi.routes())

export default app
