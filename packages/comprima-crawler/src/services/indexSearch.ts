import axios from 'axios'

export const indexSearch = async (level: string) => {
  console.log('Call', level)
  return axios
  .get(`http://localhost:4000/indexSearch?query=scania&levels=${level}`, {})
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
