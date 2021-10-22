import axios from 'axios';

const backend =
  process.env['NODE_ENV'] === 'prod' ? window.location.origin : 'http://localhost:3000';

export const getUtilityConnectToken = async () => {
  const response = await axios.post(`${backend}/utility_connect_token`, {}, { withCredentials: true });
  return response.data.utilityConnectToken;
};

export const deleteUser = async (callback) => {
  axios.post(`${backend}/delete_user`, {}, { withCredentials: true }).then(callback);
}
