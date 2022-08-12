import axios from 'axios';
import dotenv from 'dotenv';
import { env } from 'process';
dotenv.config();

const arcadiaApi = axios.create({
  baseURL: 'https://api.arcadia.com',
});

const getArcAccessToken = async () => {
  const tokenResponse = await arcadiaApi.post('/auth/access_token', {
    client_id: env['ARC_API_CLIENT_ID'],
    client_secret: env['ARC_API_CLIENT_SECRET'],
  });

  return tokenResponse.data.access_token;
}

const setArcHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Arc-Version': '2021-11-17',
});

export const getUtilityAccount = async (utilityAccountId) => {
  const accessToken = await getArcAccessToken();

  const response = await arcadiaApi.get(
    `/utility_accounts/${utilityAccountId}`,
    {
      headers: setArcHeaders(accessToken),
    },
  );

  return response.data
}

