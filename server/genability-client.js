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
  if (!arcUtilityStatement.tariff) {
    throw "This Utility Statement does not have a known tariff!";
  }

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

  genabilityApi.post(`rest/v1/accounts/${genabilityAccountId}/tariffs`, body, {
    headers: genabilityHeaders,
  });
};

export const createUsageProfileIntervalData = async (
  genabilityAccountId,
  arcUtilityStatement
) => {
  const intervalData = await getIntervalData(
    arcUtilityStatement.id,
    arcUtilityStatement.utility_account_id //TODO: camelCase incoming responses
  );

  const intervalInfoData = intervalData.map((interval) => {
    return {
      fromDateTime: interval.start_time, //TODO: camelCase incoming responses
      toDateTime: interval.end_time, //TODO: camelCase incoming responses
      quantityUnit: "kwh",
      quantityValue: interval.kwh,
    };
  });

  console.log(intervalInfoData);
  const body = {
    accountId: genabilityAccountId,
    profileName: "Interval Data",
    description: `Usage Profile using Interval Data for Utility Account ${arcUtilityStatement.utility_account_id}`, //TODO: camelCase incoming responses
    isDefault: true,
    serviceTypes: "ELECTRICITY",
    sourceId: "ReadingEntry",
    intervals: intervalInfoData,
  };

  try {
    const result = await genabilityApi.put(`rest/v1/profiles`, body, {
      headers: genabilityHeaders,
    });
    console.log(result);
  } catch (error) {
    console.log(error.response.data.status);
  }
};

// // Used for each Billing Calculation
// // TODO: WTF?
export const createUsageProfileSolarData = async (
  genabilityAccountId,
  arcUtilityStatement
) => {
  //   const body = {
  //     accountId: genabilityAccountId,
  //     profileName: "Interval Data",
  //     description: `Usage Profile using Solar Data for Utility Account ${arcUtilityStatement.utilityAccountId}`,
  //     isDefault: true,
  //     serviceTypes: "SOLAR_PV",
  //     sourceId: "SolarPvModel",
  //     properties: {
  //       systemSize: {
  //         keyName: "systemSize",
  //         dataValue: 5,
  //       },
  //     },
  //   };
  //   genabilityApi.put(`rest/v1/profiles`, body, {
  //     headers: genabilityHeaders,
  //   });
};

export const calculateCurrentBillCost = async (arcUtilityStatement) => {
  //   const body = {
  //     fromDateTime: arcUtilityStatement.serviceStartDate,
  //     toDateTime: arcUtilityStatement.serviceEndDate, //TODO: this should be inclusive of the end date for MOST utilities (add +1.day).
  //     billingPeriod: true,
  //     minimums: false,
  //     groupBy: "MONTH",
  //     detailLevel: "CHARGE_TYPE_AND_TOU",
  //   };
  //   await genabilityApi.post(
  //     `rest/v1/accounts/pid/${arcUtilityStatement.utilityAccountId}/calculate/`,
  //     body,
  //     {
  //       headers: genabilityHeaders,
  //     }
  //   );
};
