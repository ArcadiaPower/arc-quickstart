import dotenv from 'dotenv';
dotenv.config();

const { PORT } = process.env;

import express from 'express';
import cors from 'cors';
import { env } from 'process';
import { validateWebhookSignature, getUtilityConnectToken } from './utils.js';


const port = PORT || 3000;
const app = express();
app.use(express.text({type: '*/*'}));

// Allow the browser to send/receive cookies from the Utility Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:8080'],
};
app.use(cors(corsOptions));

// This is the endpoint used by the Utility Connect Component (in utility-connect-widget.jsx) to request a Utility Connect Token
app.post('/utility_connect_token', async (req, res) => {
  try {
    const utilityConnectToken = await getUtilityConnectToken();
    res.json({ utilityConnectToken });
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

  console.log('Received a webhook with data:');
  console.dir(JSON.parse(req.body), { depth: null });
  res.sendStatus(200);
});

// Starts the server
app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
