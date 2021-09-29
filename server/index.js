import dotenv from 'dotenv';
dotenv.config();

const { PORT } = process.env;

import express from 'express';
import cors from 'cors';
import { env } from 'process';
import { validateWebhookSignature, getUtilityConnectDetails, logWebhookContents } from './utils.js';


const port = PORT || 3000;
const app = express();
app.use(express.text({type: '*/*'}));

// In this contrived example, use this global var to keep track of the current User ID
let currentClientUserId = null;
const matchesClientId = (webhookPacket) => {
  // Check if data (object or array) contains client user id
  if (!currentClientUserId) return false
  const isArray = webhookPacket.data.length >= 0
  if (isArray) {
    return webhookPacket.data.some((data) => {
      return data.client_user_id === currentClientUserId
    })
  } else {
    return webhookPacket.data.client_user_id === currentClientUserId
  }
}

// Allow the browser to send/receive cookies from the Utility Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:8080'],
};
app.use(cors(corsOptions));

// This is the endpoint used by the Utility Connect Component (in utility-connect-widget.jsx) to request a Utility Connect Token
app.post('/utility_connect_token', async (req, res) => {
  try {
    // Create an artificial, unique client_user_id and request a Utility Connect Token
    const utilityConnectDetails = await getUtilityConnectDetails();
    // Save the client_user_id so we can filter incoming webhooks to this user
    currentClientUserId = utilityConnectDetails.clientUserId.toString();
    // Send the Utility Connect Token to the front-end to initialize Utility Connect scoped to this user
    res.json({ utilityConnectToken: utilityConnectDetails.utilityConnectToken });
  } catch (error) {
    console.log(error);

    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.sendStatus(500);
    }
  }
});

// This is the endpoint that webhooks are delivered to
app.post('/webhook_listener', (req, res) => {
  validateWebhookSignature(req);

  const webhookPacket = JSON.parse(req.body);
  const test = webhookPacket.type === 'test'
  // Always print out test webhook contents because they aren't scoped to a user
  if (test || matchesClientId(webhookPacket)) {
    logWebhookContents(webhookPacket)
  }

  res.sendStatus(200);
});

// Starts the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
