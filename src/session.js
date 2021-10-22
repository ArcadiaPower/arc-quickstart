import axios from 'axios';

const backend ='http://localhost:3010';

export const getUtilityConnectToken = async () => {
  const response = await axios.post(`${backend}/utility_connect_token`, {}, { withCredentials: true });
  return response.data.utilityConnectToken;
};
