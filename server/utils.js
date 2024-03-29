import axios from "axios";
import { createHmac } from "crypto";
import timingSafeCompare from "tsscmp";
import dotenv from "dotenv";
import { env } from "process";
dotenv.config();

const arcadiaApi = axios.create({
  baseURL: "https://api.arcadia.com",
});

const getAccessToken = async () => {
  const tokenResponse = await arcadiaApi.post(
    "/auth/access_token",
    {
      client_id: env["ARC_API_CLIENT_ID"],
      client_secret: env["ARC_API_CLIENT_SECRET"],
    },
    {
      headers: setHeaders(),
    }
  );

  return tokenResponse.data.access_token;
};

const setHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Arc-Version": "2022-10-13",
});

export const getConnectDetails = async () => {
  const accessToken = await getAccessToken();
  // In your application this should be the unique ID you have associated with the user
  const clientUserId = parseInt(String(new Date().getTime()).substr(-5));

  const connectTokenResponse = await arcadiaApi.post(
    "/auth/connect_token",
    { client_user_id: clientUserId },
    {
      headers: setHeaders(accessToken),
    }
  );

  // Return the Connect Token so the front-end can initialize Connect
  // Also return the client_user_id for the purposes of this demo so it can optionally delete the user
  return {
    connectToken: connectTokenResponse.data.connect_token,
    clientUserId: clientUserId,
  };
};

export const deleteUser = async (clientUserId) => {
  const accessToken = await getAccessToken();

  await arcadiaApi.delete(`/users/${clientUserId}`, {
    headers: setHeaders(accessToken),
  });
};

const secondsToStale = 300; // 5 minutes

export const validateWebhookSignature = (req) => {
  const nowTimestamp = Math.floor(Date.now() / 1000); // Seconds since epoch

  // 1. Extract the timestamp and signatures from the header
  const webhookTimestamp = req.header("Arc-Webhook-Timestamp");
  const webhookSignature = req.header("Arc-Webhook-Signature");

  // 2. Prepare the payload string by concatenating the timestamp with the body
  const payloadToSign = `${webhookTimestamp}.${req.body}`;

  // 3. Calculate the Signature using your Arcadia Webhook Secret
  const hmac = createHmac("sha256", env["ARC_WEBHOOK_SIGNING_KEY"]);
  const calculatedSignature = hmac.update(payloadToSign).digest("hex");

  // 4. If the timestamp is older than the threshold, this may be a replay attack
  if (nowTimestamp - webhookTimestamp > secondsToStale) {
    throw Error("This webhook was received outside of the defined tolerance.");
  }

  // 5. If the signatures don't match, this may be a fraudulent webhook
  // Be sure to use a constant time string comparison algorithm to prevent timing attacks
  if (!timingSafeCompare(webhookSignature, calculatedSignature)) {
    throw Error(
      "The calculated signature does not match the signature provided in the request header"
    );
  }
};
