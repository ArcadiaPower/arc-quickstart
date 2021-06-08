import { createHmac } from 'crypto';
import { env } from 'process';
import timingSafeCompare from 'tsscmp';

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
}
