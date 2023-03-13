import axios from 'axios'
import config from '../common/config'
import log from '../common/log'

export const indexSearch = async (level: string) => {
  const query = 'ignored' // NOTE: This value is not used.
  const url = `${config.comprimaUrl}/indexSearch?query=${query}&levels=${level}`
  log.debug(`Calling comprima adapter on ${url}`)
  return axios
  .get(url, {})
  .then(({ data }) => {
    return data;
  })
  .catch((e) => {
    log.error('Error', e)
    throw e;
  });
}
