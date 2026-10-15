import app from './app'
import config from './common/config'

app.listen(config.port, () => {
  console.log(`foretagskallan-api listening on http://localhost:${config.port}`)
})
