import axios from 'axios';
import dotenv from 'dotenv';
import { env } from 'process';
// import { constants } from 'os';
dotenv.config();

const genabilityApi = axios.create({
  baseURL: 'https://api.genability.com'
})

// https://developer.genability.com/api-reference/basics/security/
const genabilityToken = Buffer.from(`${env['GENABILITY_APPLICATION_ID']}:${env['GENABILITY_APPLICATION_KEY']}`).toString('base64')
const genabilityHeaders = { Authorization: `Basic ${genabilityToken}` }

export const createSwitchAccount = async(utilityAccount) => {  
  const body = {
    providerAccountId: utilityAccount.client_user_id, 
    accountName:`Bill Calculation Quickstart for ${utilityAccount.client_user_id}`,
    address: {
      address1: utilityAccount.serviceAddressStreetOne,
      address2: utilityAccount.serviceAddressStreetTwo,
      city: utilityAccount.serviceAddressCity,
      state: utilityAccount.serviceAddressState,
      zip: utilityAccount.serviceAddressZip
    },
    properties:{
      customerClass:{
          keyName: 'customerClass',
          dataValue: 1
      }
    }
  }

  // You can send either a POST or a PUT request to create an account. Using a PUT request allows an “upsert”, where the account will be added if it doesn’t exist yet, or updated if it does. 
  // You use the providerAccountId property as your own unique identifier. Why is that a good thing?
  const response = await genabilityApi.put(
    'rest/v1/accounts',
    body,
    { headers: genabilityHeaders } 
  )

  return response.data.results[0].accountId 
};
