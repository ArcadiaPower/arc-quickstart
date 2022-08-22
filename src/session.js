import axios from "axios";

const backend = "http://localhost:3010";

export const createGenabilityAccount = async (utilityAccountId) => {
  axios.post(
    `${backend}/create_genability_account`,
    { utilityAccountId },
    { withCredentials: true }
  );
};

export const fetchUtilityStatements = async (utilityAccountId) => {
  axios.get(
    `${backend}/fetch_utility_statements?utilityAccountId=${utilityAccountId}`,
    { withCredentials: true }
  );
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
