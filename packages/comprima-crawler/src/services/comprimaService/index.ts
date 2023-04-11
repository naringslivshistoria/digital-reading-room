import axios, { AxiosError } from 'axios';
import config from '../../common/config';
import log from '../../common/log';

// TODO: Figure out exactly what we get - is it levels or ids or something else?
export const getUpdatedLevels = async () => {
  // TODO: Replace this mock with a real call to the comprima adapter.
  return Promise.resolve([41070, 41071, 41072, 41073]);
};

export const indexLevel = async (level: number) => {
  const url = `${config.comprimaAdapter.url}/indexLevels?levels=${level}`;
  log.debug(`Calling comprima adapter on ${url}`);

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
      };
      log.warn('Comprima adapter request failed', errorSummary);
      throw error;
    });
};
