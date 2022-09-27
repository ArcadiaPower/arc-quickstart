import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  validateWebhookSignature,
  getConnectDetails,
  deleteUser,
} from "./utils.js";
dotenv.config();

const port = 3010;
const app = express();
app.use(express.text({ type: "*/*" }));

// Allow the browser to send/receive cookies from the Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:8090"],
};
app.use(cors(corsOptions));

// In this contrived example, use this global var to keep track of the current User ID
let currentClientUserId = null;

// This is the endpoint used by Connect (in connect-widget.jsx) to request a Connect Token
app.post("/connect_token", async (req, res) => {
  try {
    // Create an artificial, unique client_user_id and request a Connect Token
    const connectDetails = await getConnectDetails();
    // Save the client_user_id so we can filter incoming webhooks to this user
    currentClientUserId = connectDetails.clientUserId.toString();
    // Send the Connect Token to the front-end to initialize Connect scoped to this user
    res.json({ connectToken: connectDetails.connectToken });
  } catch (error) {
    console.log(error);

    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.sendStatus(500);
    }
  }
});

app.post("/delete_user", async (req, res) => {
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
app.post("/webhook_listener", (req, res) => {
  validateWebhookSignature(req);

  console.log("Received a webhook with data:");
  console.dir(JSON.parse(req.body), { depth: null });
  res.sendStatus(200);
});

// Starts the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
