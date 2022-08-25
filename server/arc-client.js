import axios from "axios";
import dotenv from "dotenv";
import { env } from "process";
dotenv.config();

const arcadiaApi = axios.create({
  baseURL: "https://api.arcadia.com",
});

const getArcAccessToken = async () => {
  const tokenResponse = await arcadiaApi.post("/auth/access_token", {
    client_id: env["ARC_API_CLIENT_ID"],
    client_secret: env["ARC_API_CLIENT_SECRET"],
  });

  return tokenResponse.data.access_token;
};

const setArcHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Arc-Version": "2021-11-17",
});

export const getUtilityAccount = async (utilityAccountId) => {
  const accessToken = await getArcAccessToken();

  const response = await arcadiaApi.get(
    `/utility_accounts/${utilityAccountId}`,
    {
      headers: setArcHeaders(accessToken),
    }
  );

  return response.data;
};

export const getUtilityStatements = async (utilityAccountId) => {
  const accessToken = await getArcAccessToken();
  const response = await arcadiaApi.get(
    `/plug/utility_statements?utility_account_id=${utilityAccountId}`,
    {
      headers: setArcHeaders(accessToken),
    }
  );

  return response.data;
};

export const getUtilityStatement = async (utilityStatementId) => {
  const accessToken = await getArcAccessToken();
  const response = await arcadiaApi.get(
    `/plug/utility_statements/${utilityStatementId}}`,
    {
      headers: setArcHeaders(accessToken),
    }
  );

  return response.data;
};

export const getIntervalData = async (
  arcUtilityStatementId,
  arcUtilityAccountId
) => {
  const accessToken = await getArcAccessToken();
  // TODO: query params for utility meter
  const response = await arcadiaApi.get(
    `/plug/utility_intervals?utility_statement_id=${arcUtilityStatementId}&utility_account_id=${arcUtilityAccountId}`,
    {
      headers: setArcHeaders(accessToken),
    }
  );
  return response.data;
};
