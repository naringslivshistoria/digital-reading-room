import app from './app';
import config from './common/config'

const port = config.port || 4001

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
