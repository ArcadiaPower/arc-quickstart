import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getUtilityAccount } from './arc-client.js';
import { createSwitchAccount } from './genability-client.js'
dotenv.config();

const { PORT } = process.env;
const port = 3010;
const app = express();
app.use(express.json());

// Allow the browser to send/receive cookies from the Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ['http://localhost:8090'],
};
app.use(cors(corsOptions));

// In this contrived example, use this global var to keep track of the genabilityAccountId
let genabilityAccountId = null;

app.post('/create_genability_account', async (req,res) => {
  const { utilityAccountId } = req.body
  try {
    const utilityAccount = await getUtilityAccount(utilityAccountId)
    console.log(utilityAccount)
    genabilityAccountId = await createSwitchAccount(utilityAccount)
    res.sendStatus(200);
  } catch (error) {
    console.log(error)
  }
}) 

// Starts the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
