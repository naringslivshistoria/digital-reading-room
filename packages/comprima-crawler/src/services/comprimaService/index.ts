import axios from 'axios'
import config from '../../common/config'
import log from '../../common/log'

// TODO: Figure out exactly what we get - is it levels or ids or something else?
export const getUpdatedLevels = async () => {
  return Promise.resolve([41070,41071,41072,41073])
}

export const indexSearch = async (levels: number[]) => {
  const query = 'ignored' // NOTE: This value is not used.
  const url = `${config.comprimaUrl}/indexSearch?query=${query}&levels=${levels}`
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
