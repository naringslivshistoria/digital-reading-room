import axios from 'axios'

export const indexSearch = async (level: string) => {
  console.log('Call', level)
  return axios
  .get(`http://localhost:4000/indexSearch?query=scania&levels=${level}`, {})
  .then(({ data }) => {
    console.log('Successfully received oauth token from FedEx.');
    return data;
  })
  .catch((e) => {
    console.error(
      `Failed to request oauth token from FedEx: ${e.toString()}`,
    );
    throw e;
  });
}
