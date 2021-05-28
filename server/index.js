import dotenv from 'dotenv';
dotenv.config();

const { PORT } = process.env;

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { env } from 'process';
import { validateWebhookSignature } from './utils.js';


const port = PORT || 3000;
const app = express();
app.use(express.text({type: '*/*'}));

// Allow the browser to send/receive cookies from the Utility Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:8080'],
};
app.use(cors(corsOptions));

// This is the endpoint used by the Utility Connect Component (in utility-connect-widget.jsx) to request an OAuth token
app.post('/token', (req, res) => {
  const arcadiaApi = axios.create({
    baseURL: 'https://sandbox.api.arcadia.com',
  });

  // Loads the API keys out of the .env file and includes them in the request to the Arcadia API for an OAuth token
  arcadiaApi
    .post('/oauth/token', {
      client_id: env['ARCADIA_OAUTH_CLIENT_ID'],
      client_secret: env['ARCADIA_OAUTH_CLIENT_SECRET'],
      grant_type: 'client_credentials',
      scope: 'utility_connect',
    })
    .then(tokenResponse => {
      // Returns just the OAuth token to the Utility Connect Component
      res.json(tokenResponse.data);
    })
    .catch(error => {
      if (error.response) {
        res.status(error.response.status).send(error.response.data);
      } else {
        res.sendStatus(500);
      }
    });
});

// This is the endpoint that webhooks are delivered to
app.post('/webhook_listener', (req, res) => {

  validateWebhookSignature(req);

  console.log('Received a webhook with data:');
  console.dir(JSON.parse(req.body), { depth: null });
  res.sendStatus(200);
});

// Starts the server
app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
