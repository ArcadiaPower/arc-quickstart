import axios from "axios";

const backend = "http://localhost:3010";

export const createGenabilityAccount = async (utilityAccountId) => {
  try {
    const response = await axios.post(
      `${backend}/create_genability_account`,
      { utilityAccountId },
      { withCredentials: true }
    );
    return response.data.genabilityAccount;
  } catch (error) {
    throw error;
  }
};

export const fetchUtilityStatements = async (utilityAccountId) => {
  try {
    const response = await axios.get(
      `${backend}/fetch_utility_statements?utilityAccountId=${utilityAccountId}`,
      { withCredentials: true }
    );

    return response.data.utilityStatements;
  } catch (error) {
    throw error;
  }
};

export const calculateCounterfactualBill = async (arcUtilityStatementId) => {
  try {
    const response = await axios.post(
      `${backend}/calculate_counterfactual_bill`,
      { utilityStatementId: arcUtilityStatementId },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
