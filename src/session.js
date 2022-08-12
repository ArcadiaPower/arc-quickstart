import axios from 'axios';

const backend ='http://localhost:3010';

export const createGenabilityAccount = async (utilityAccountId) => {
  axios.post(`${backend}/create_genability_account`, { utilityAccountId }, { withCredentials: true })
};