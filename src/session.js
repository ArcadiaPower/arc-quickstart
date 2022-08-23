import axios from "axios";

const backend = "http://localhost:3010";

export const createGenabilityAccount = async (utilityAccountId) => {
  const response = await axios.post(
    `${backend}/create_genability_account`,
    { utilityAccountId },
    { withCredentials: true }
  );

  return response.data.genabilityAccount;
};

export const fetchUtilityStatements = async (utilityAccountId) => {
  const response = await axios.get(
    `${backend}/fetch_utility_statements?utilityAccountId=${utilityAccountId}`,
    { withCredentials: true }
  );

  return response.data.utilityStatements;
};

export const calculateCounterfactualBill = async (utilityStatementId) => {
  axios.post(
    `${backend}/calculate_counterfactual_bill?`,
    { utilityStatementId },
    {
      withCredentials: true,
    }
  );
};
