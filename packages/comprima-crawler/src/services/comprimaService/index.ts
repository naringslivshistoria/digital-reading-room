import axios, { AxiosError } from 'axios'
import config from '../../common/config'
import log from '../../common/log'

// TODO: Use a custom error class.
export class FooError extends Error {
  constructor(msg: string) {
      super(msg);

      // Set the prototype explicitly.
      Object.setPrototypeOf(this, FooError.prototype);
  }

  sayHello() {
      return "hello " + this.message;
  }
}

// TODO: Figure out exactly what we get - is it levels or ids or something else?
export const getUpdatedLevels = async () => {
  return Promise.resolve([41070,41071,41072,41073])
}

export const indexSearch = async (level: number) => {
  const query = 'ignored' // NOTE: This value is not used.
  const url = `${config.comprimaUrl}/indexSearch?query=${query}&levels=${level}`
  log.debug(`Calling comprima adapter on ${url}`)
  return axios
  .get(url, {})
  .then(({ data }) => {
    return data;
  })
  .catch((error: AxiosError) => {
    const errorSummary = {
      code: error.code,
      data: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    }
    log.warn('Comprima adapter request failed', errorSummary)
    throw error
  });
}
