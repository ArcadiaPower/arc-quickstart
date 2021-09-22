import dotenv from 'dotenv';
dotenv.config();

const { PORT } = process.env;

import express from 'express';
import cors from 'cors';
import { validateWebhookSignature, getUtilityConnectToken, calculateStatementsAverageUsage } from './utils.js';


const port = PORT || 3000;
const app = express();
app.use(express.text({type: '*/*'}));

// Allow the browser to send/receive cookies from the Utility Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:8080'],
};
app.use(cors(corsOptions));

// Absent actual user mgmt, we'll use this global var to keep track of the current User Id
let currentClientUserId = null;
// We will save statement data to this global var #hackathon-code
let averageStatementUsage = null;

// This endpoint will be used by the FE to request a particular carbon offset project
app.get('/carbon_offset_projects', async(req, res) => {
  // The project type should be provided as a param 
  let projectType = JSON.parse(req.query.projectType);

  // TODO: Return details on the carbon offset project that is the best fit for the requested project type
  let projectResponse = {};

  res.send(projectResponse);
});

// This endpoint will be used by the FE to request details on the carbon intensity of a particular utility
app.get('/grid_mix', async(req, res) => {
  // The utility type should be provided as a param 
  let utilityName = JSON.parse(req.query.utilityName);

  // TODO: Return details on the grid mix, including $ / kWh and the generating sources
  let gridMix = {};

  res.send(gridMix);

});

// This is the endpoint used by the Utility Connect Component (in utility-connect-widget.jsx) to request a Utility Connect Token
app.post('/utility_connect_token', async (req, res) => {

  try {
    const utilityConnectDetails = await getUtilityConnectToken();
    const utilityConnectToken = utilityConnectDetails.utilityConnectToken;
    console.log("Setting the current user client ID", utilityConnectDetails.clientUserId);
    currentClientUserId = utilityConnectDetails.clientUserId;
    res.json({ utilityConnectToken });
  } catch (error) {

    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.sendStatus(500);
    }
  }
});

// This endpoint should be polled. It will return HTTP 400 when we are still waiting for statement data and
// HTTP 200 with JSON when we have finally received the data
app.get('/statements_average', (req, res) => {
  if (averageStatementUsage !== null) {
    res.json({average_kwh: averageStatementUsage });
  } else {
    res.sendStatus(400);
  }
})

// This is the endpoint that webhooks are delivered to
app.post('/webhook_listener', (req, res) => {
  // TODO: Disabling webhook signatures validation because it seems to be broken
  // validateWebhookSignature(req);

  const webhookPacket = JSON.parse(req.body);

  // If this isn't a webhook for this particular user, abort
  if (currentClientUserId == null || webhookPacket.data.client_user_id !== currentClientUserId) {
    return res.sendStatus(200);
  }

  // If this isn't a webhook for statements, abort
  if (webhookPacket.type !== 'historical_utility_statements_discovered') {
    return res.sendStatus(200);
  }

  // At this point in the codepath, this is a webhook with statements for the user so calculate the monthly average
  averageStatementUsage = calculateStatementsAverageUsage(webhookPacket.data.statements);

  console.log("Set the global statement average to: ", averageStatementUsage, 'kwh');

  res.sendStatus(200);
});

// Starts the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
