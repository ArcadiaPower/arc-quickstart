import axios from "axios";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { env } from "process";
import { getIntervalData } from "./arc-client.js";
import { readFile } from 'fs/promises';
const mock8760Data = JSON.parse(
  await readFile(
    new URL('./assets/mock-8760-solar-profile.json', import.meta.url)
  )
);
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
  const parsedTariffId = arcUtilityStatement.tariff.mainTariffId.replace(
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
    arcUtilityStatement.utilityAccountId
  );

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
    readingData: intervalInfoData,
  };

  genabilityApi.put(`rest/v1/profiles`, body, {
    headers: genabilityHeaders,
  });
};

export const getAndTransform8760Data = (startDateTime) => {
  let currentDateTime = dayjs(startDateTime);
  const baselineMeasures = mock8760Data.results[0].baselineMeasures;
  return baselineMeasures.map(row => {
    const startTime = currentDateTime;
    const endTime = currentDateTime.add(1, 'hour')
    const transformedRow = {
      fromDateTime: startTime.toISOString(),
      toDateTime: endTime.toISOString(),
      quantityUnit: "kWh",
      quantityValue: row.v.toString()
    }
    currentDateTime = endTime
    return transformedRow;
  })
}

export const createProductionProfileSolarData = async (genabilityProviderAccountId) => {
  const body = {
    providerAccountId: genabilityProviderAccountId,
    providerProfileId: 'PVWATTS_5kW',
    profileName: "Solar System Actual Production",
    serviceTypes: "SOLAR_PV",
    sourceId: "ReadingEntry",
    properties: {
      systemSize: {
        keyName: "systemSize",
        dataValue: "5"
      }
    },
    readingData: getAndTransform8760Data("2022-01-01T00:00-0700")
  }

  // https://www.switchsolar.io/api-reference/account-api/usage-profile/#example-5---upload-a-solar-profile-with-baselinemeasure-data
  // This will add a new profile (if one with this providerProfileId doesn’t exist)
  // and at the same time also add the readings included in the request.

  const result = await genabilityApi.put(`/rest/v1/profiles`, body, {
    headers: genabilityHeaders
  })

  console.log('new or updated solar production profile: ', result.data)
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
