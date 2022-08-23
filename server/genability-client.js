import axios from "axios";
import dotenv from "dotenv";
import { env } from "process";
import { getIntervalData } from "./arc-client.js";
dotenv.config();

const genabilityApi = axios.create({
  baseURL: "https://api.genability.com",
});

// https://developer.genability.com/api-reference/basics/security/
const genabilityToken = Buffer.from(
  `${env["GENABILITY_APPLICATION_ID"]}:${env["GENABILITY_APPLICATION_KEY"]}`
).toString("base64");
const genabilityHeaders = { Authorization: `Basic ${genabilityToken}` };

export const createSwitchAccount = async (arcUtilityAccount) => {
  const body = {
    providerAccountId: arcUtilityAccount.id,
    accountName: `Bill Calculation Quickstart for Arc Utility Account ${arcUtilityAccount.id}`,
    address: {
      address1: arcUtilityAccount.serviceAddressStreetOne,
      address2: arcUtilityAccount.serviceAddressStreetTwo,
      city: arcUtilityAccount.serviceAddressCity,
      state: arcUtilityAccount.serviceAddressState,
      zip: arcUtilityAccount.serviceAddressZip,
    },
    properties: {
      customerClass: {
        keyName: "customerClass",
        dataValue: 1,
      },
    },
  };

  // You can send either a POST or a PUT request to create an account. Using a PUT request allows an “upsert”, where the account will be added if it doesn’t exist yet, or updated if it does.
  // You use the providerAccountId property as your own unique identifier. Why is that a good thing?
  const response = await genabilityApi.put("rest/v1/accounts", body, {
    headers: genabilityHeaders,
  });

  return response.data.results[0];
};

// We are updating the tariff collection everytime we try to calculate a counterfactual bill.
// https://www.switchsolar.io/api-reference/account-api/account-tariff/
export const createTariff = async (
  genabilityAccountId,
  arcUtilityStatement
) => {
  // The following will transform the tariff into the correct form for Genability e.g. gen_mtid_522 => 522
  const parsedTariffId = arcUtilityStatement.tariff.main_tariff_id.replace(
    "gen_mtid_",
    ""
  );

  const body = {
    masterTariffId: parsedTariffId,
    serviceType: "ELECTRICITY",
    effectiveDate: arcUtilityStatement.serviceStartDate,
  };

  await genabilityApi.post(
    `rest/v1/accounts/${genabilityAccountId}/tariffs`,
    body,
    { headers: genabilityHeaders }
  );
};

// If you do not have interval data, you can create a usage profile with statement data
// export const createUsageProfileStatementData = async (
//   genabilityAccountId,
//   arcHistoricalUtilityStatements
// ) => {
//   const readingData = arcHistoricalUtilityStatements.map((utilityStatement) => {
//     return {
//       fromDateTime: utilityStatement.statementStartDate,
//       toDateTime: utilityStatement.statementStartDate,
//       quantityUnit: "kwh",
//       quantityValue: utilityStatement.kwh,
//     };
//   });

//   const body = {
//     accountId: genabilityAccountId, // Can alternately provide the Genability accountId
//     profileName: "Utility Statements",
//     description: `Usage Profile using Utility Statements for User ${arcClientUserId}`,
//     isDefault: true,
//     serviceTypes: "ELECTRICITY",
//     sourceId: "ReadingEntry",
//     readingData: readingData,
//   };

//   const response = await genabilityApi.put(`rest/v1/profiles`, body, {
//     headers: genabilityHeaders,
//   });
// };

export const createUsageProfileIntervalData = async (
  genabilityAccountId,
  arcUtilityStatement
) => {
  const intervalData = await getIntervalData(arcUtilityStatement);
  const intervalInfoData = intervalData.map((interval) => {
    return {
      fromDateTime: interval.startTime,
      toDateTime: interval.endTime,
      quantityUnit: "kwh",
      quantityValue: interval.kwh,
    };
  });

  const body = {
    accountId: genabilityAccountId,
    profileName: "Interval Data",
    description: `Usage Profile using Interval Data for Utility Account ${arcUtilityStatement.utilityAccountId}`,
    isDefault: true,
    serviceTypes: "ELECTRICITY",
    sourceId: "ReadingEntry",
    intervals: intervalInfoData,
  };

  await genabilityApi.put(`rest/v1/profiles`, body, {
    headers: genabilityHeaders,
  });
};

// Used for each Billing Calculation
// TODO: WTF?
export const createUsageProfileSolarData = async (
  genabilityAccountId,
  arcUtilityStatement
) => {
  const body = {
    accountId: genabilityAccountId,
    profileName: "Interval Data",
    description: `Usage Profile using Solar Data for Utility Account ${arcUtilityStatement.utilityAccountId}`,
    isDefault: true,
    serviceTypes: "SOLAR_PV",
    sourceId: "SolarPvModel",
    properties: {
      systemSize: {
        keyName: "systemSize",
        dataValue: 5,
      },
    },
  };

  await genabilityApi.put(`rest/v1/profiles`, body, {
    headers: genabilityHeaders,
  });
};
