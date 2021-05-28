import axios from 'axios';

const backend =
  process.env['NODE_ENV'] === 'prod' ? window.location.origin : 'http://localhost:3000';


export const getComponentToken = async () => {
  const response = await axios.post(`${backend}/token`, {}, { withCredentials: true });
  return response.data.access_token;
};
