import axios from 'axios';

const backend ='http://localhost:3010';

export const getConnectToken = async () => {
  const response = await axios.post(`${backend}/connect_token`, {}, { withCredentials: true });
  return response.data.connectToken;
};

export const deleteUser = async (callback) => {
  axios.post(`${backend}/delete_user`, {}, { withCredentials: true }).then(callback);
}
