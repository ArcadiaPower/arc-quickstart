import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const { PORT } = process.env;
import { validateWebhookSignature, getUtilityConnectDetails, deleteUser } from './utils.js';


const port = PORT || 3000;
const app = express();
app.use(express.text({type: '*/*'}));

// Allow the browser to send/receive cookies from the Utility Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:8080'],
};
app.use(cors(corsOptions));

// In this contrived example, use this global var to keep track of the current User ID
let currentClientUserId = null;

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

app.post('/delete_user', async (req, res) => {
  try {
    await deleteUser(currentClientUserId);
    currentClientUserId = null;
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
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
  console.log(`Backend server running on port ${port}`);
});
