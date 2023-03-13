import axios from 'axios'
import config from '../common/config'

export const indexSearch = async (level: string) => {
  console.log('Call', level)
  return axios
  .get(`${config.comprimaUrl}/indexSearch?query=scania&levels=${level}`, {})
  .then(({ data }) => {
    return data;
  })
  .catch((e) => {
    // console.error(
    //   `Failed to call Comprima Adapter: ${e.toString()}`,
    // );
    throw e;
  });
}
