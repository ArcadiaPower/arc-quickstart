import axios from 'axios';
import { createHmac } from 'crypto';
import { env } from 'process';
import timingSafeCompare from 'tsscmp';

const arcadiaApi = axios.create({
  baseURL: 'https://sandbox.api.arcadia.com',
});

const getAccessToken = async () => {
  const tokenResponse = await arcadiaApi.post('/auth/access_token', {
    client_id: env['ARCADIA_API_CLIENT_ID'],
    client_secret: env['ARCADIA_API_CLIENT_SECRET'],
  });

  return tokenResponse.data.access_token;
};

const authenticatedHeaders = (accessToken) => {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
};

export const registerWebhookEndpoint = async (url) => {
  const accessToken = await getAccessToken();

  const response = await arcadiaApi.post(
    "/webhook/endpoints",
    { url: url },
    { headers: authenticatedHeaders(accessToken) }
  );

  env['ARCADIA_WEBHOOK_SIGNING_KEY'] = response.data.signing_key;
};

// Generates a random, unique client_user_id and fetches a Utility Connect Token scoped to it
export const getUtilityConnectDetails = async () => {
  const accessToken = await getAccessToken();

  // In your application this should be the unique ID you have associated with the user
  const clientUserId = parseInt(String(new Date().getTime()).substr(-5));

  const utilityConnectTokenResponse = await arcadiaApi.post(
    '/auth/utility_connect_token',
    { client_user_id: clientUserId },
    { headers: authenticatedHeaders(accessToken) }
  );

  // Return the Utility Connect Token so the front-end can initialize Utility Connect
  // Also return the client_user_id for the purposes of this demo so it can filter incoming webhooks
  return {
    utilityConnectToken: utilityConnectTokenResponse.data.utility_connect_token,
    clientUserId: clientUserId
  };
};

const secondsToStale = 300; // 5 minutes

export const validateWebhookSignature = req => {
  const nowTimestamp = Math.floor( Date.now() / 1000 ); // Seconds since epoch

  // 1. Extract the timestamp and signatures from the header
  const webhookTimestamp = req.header('Arcadia-Webhook-Timestamp');
  const webhookSignature = req.header('Arcadia-Webhook-Signature');

  // 2. Prepare the payload string by concatenating the timestamp with the body
  const payloadToSign = `${webhookTimestamp}.${req.body}`;

  // 3. Calculate the Signature using your Arcadia Webhook Secret
  const hmac = createHmac('sha256', env['ARCADIA_WEBHOOK_SIGNING_KEY']);
  const calculatedSignature = hmac.update(payloadToSign).digest('hex');

  // 4. If the timestamp is older than the threshold, this may be a replay attack
  if ((nowTimestamp - webhookTimestamp) > secondsToStale) {
    throw Error('This webhook was received outside of the defined tolerance.');
  }

  // 5. If the signatures don't match, this may be a fraudulent webhook
  // Be sure to use a constant time string comparison algorithm to prevent timing attacks
  if (!timingSafeCompare(webhookSignature, calculatedSignature)) {
    throw Error('The calculated signature does not match the signature provided in the request header');
  }
};

export const logWebhookContents = webhookBody => {
  console.log('Received a webhook with data:');
  console.dir(webhookBody, { depth: null });
};
