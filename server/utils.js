import axios from 'axios';
import { createHmac } from 'crypto';
import { env } from 'process';
import timingSafeCompare from 'tsscmp';

export const getUtilityConnectToken = async () => {
  const arcadiaApi = axios.create({
    baseURL: 'https://sandbox.api.arcadia.com',
  });

  const tokenResponse = await arcadiaApi.post('/auth/access_token', {
    client_id: env['ARCADIA_API_CLIENT_ID'],
    client_secret: env['ARCADIA_API_CLIENT_SECRET'],
  });

  const accessToken = tokenResponse.data.access_token;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // In your application this should be the unique ID you have associated with the user
  const clientUserId = parseInt(String(new Date().getTime()).substr(-5));

  const utilityConnectTokenResponse = await arcadiaApi.post(
    '/auth/utility_connect_token',
    { client_user_id: clientUserId },
    {
      headers,
    },
  );

  return utilityConnectTokenResponse.data.utility_connect_token;
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
