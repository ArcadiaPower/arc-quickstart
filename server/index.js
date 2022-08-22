import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getUtilityAccount,
  getUtilityStatements,
  getUtilityStatement,
} from "./arc-client.js";
import {
  createSwitchAccount,
  createTariff,
  createUsageProfileIntervalData,
} from "./genability-client.js";
dotenv.config();

const { PORT } = process.env;
const port = 3010;
const app = express();
app.use(express.json());

// Allow the browser to send/receive cookies from the Connect Component in development mode
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:8090"],
};
app.use(cors(corsOptions));

// In this contrived example, use this global var to keep track of the genabilityAccountId
let genabilityAccountId = null;

app.post("/create_genability_account", async (req, res) => {
  const { utilityAccountId } = req.body;
  try {
    const arcUtilityAccount = await getUtilityAccount(utilityAccountId);
    genabilityAccountId = await createSwitchAccount(arcUtilityAccount);
    res.status(200);
  } catch (error) {
    console.log(error);
  }
});

app.get("/fetch_utility_statements", async (req, res) => {
  const { utilityAccountId } = req.query;

  try {
    const arcUtilityStatements = await getUtilityStatements(utilityAccountId);
    console.log("statements!", arcUtilityStatements);
    res.json({ utilityStatements: arcUtilityStatements });
    res.status(200);
  } catch (error) {
    console.log(error);
  }
});

app.post("/calculate_counterfactual_bill", async (req, res) => {
  const { utilityStatementId } = req.query;
  const arcUtilityStatement = getUtilityStatement(utilityStatementId);

  try {
    // Step 1: Post Tariff from current UtilityStatement. The genabilityAccountId is set as a Global variable.
    await createTariff(genabilityAccountId, arcUtilityStatement);
    // Step 2: Update Statement Usage Profile -- skipping for this reference implmentation because there SHOULD be interval data
    // Step 3: Update Interval Data Usage Profile
    await createUsageProfileIntervalData(
      genabilityAccountId,
      arcUtilityStatement
    );
    // Step 4: Update Solar Usage Profile
    await createUsageProfileSolarData(genabilityAccountId);
    // Step 5: Calculate Costs

    res.status(200);
  } catch (error) {
    console.log(error);
  }
});

// Starts the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
