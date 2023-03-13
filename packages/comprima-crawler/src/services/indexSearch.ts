import axios from 'axios'
import config from '../common/config'
import log from '../common/log'

export const indexSearch = async (level: string) => {
  const url = `${config.comprimaUrl}/indexSearch?query=scania&levels=${level}`
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
