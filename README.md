# Background

This application is intended to be a reference implementation for using Arc/Genability switch to calculate counterfactual bills.
Note that this app does NOT walk through integrating with Connect. If you wish to do a Connect run through please see [arc-quickstart](https://github.com/ArcadiaPower/arc-quickstart)

This application assumes you have already connected an account using your Sandbox API keys. You will need an Arc `utility_account_id` to run through this reference implementation. From there you will be prompted to

1. Create a Genability Switch Account for the Arc Utility Account
2. Fetch the associated Arc Utility Statements through Plug
3. Calculate the Costs for a Utility Statement with and without Solar

## Setup

You will need to set up a few environment variables to get this reference implementation up and running! The easiest way to get the necessary variables is to copy the values in `.env-example` to your `.env`

`cp .env-example .env`

Now we need to fill out each variable:

- ARC_API_CLIENT_ID: Visit your Arc Dashboard and select "View and save your API keys". Copy the Client ID. We recommend using Sandbox keys for this application.
- ARC_API_CLIENT_SECRET: Visit your Arc Dashboard and select "View and save your API keys". Copy the Secret. We recommend using Sandbox keys for this application.
- GENABILITY_APPLICATION_ID: Visit your Genability Dashboard. Go to your Applications. Create an application for this reference implementation. Copy and paste the App ID.
- GENABILITY_APPLICATION_KEY: Visit your Genability Dashboard. Go to your Applications. Copy and paste the App key for the corresponding application.

If you are setting this up as an Arcadia developer, the `GENABILITY_APPLICATION_ID` and `GENABILITY_APPLICATION_KEY` for the reference implementation can be found in OnePassword: Genability Counterfactual Bill keys.

## Running the App

1. Make sure you are using the correct node version `nvm use`
2. Install project dependencies `npm ci`
3. Start the node server/react application `npm start`
4. Go to http://localhost:8090 and follow the instructions from there!
