This project demonstrates how to use Arcadia's [utility-connect-react](https://github.com/ArcadiaPower/utility-connect-react/) component in an example integration against the [Arcadia Developer Platform API](http://developers.arcadia.com).

# Arcadia's Platform Quickstart

This example application will load a React web app where you can enter utility credentials. The data related to the utility account will be delivered to your terminal via webhooks.

You'll need your Arcadia API keys, a computer that can run Node.js version 14.x, and familiarity with the command line.


## Configuration

The first step is to clone this example application. Use `git` to download the repository:
```.sh
git clone https://github.com/ArcadiaPower/platform-quickstart.git
```

Next, ensure you're using Node.js version 14.x (and NPM version 6.x). The easiest way to do that is by using `nvm` within the project directory (if you don't already have `nvm` installed, see [installation instructions here](https://github.com/nvm-sh/nvm#installing-and-updating)):
```.sh
cd platform-quickstart && nvm use
```

Now install the project's dependencies:
```.sh
npm run build
```

## API Keys

Next, create a `.env` file from the template:
```.sh
cp .env-example .env
```

Open it and fill in your Arcadia `ARCADIA_API_CLIENT_ID` and `ARCADIA_API_CLIENT_SECRET`. Leave `ARCADIA_WEBHOOK_SIGNING_KEY` as is for now - we'll come back to it.

## Hello, World
Let's run the React web app and Node server so we can see this demo application in action.
```.sh
npm start
```

This command will concurrently start:

1. A React web app demonstrating use of Arcadia's front-end integration component, called Utility Connect.
2. An example backend [server](./server/index.js) that calls the Arcadia API to create Utility Connect Tokens, which are used to instantiate Utility Connect and scope it to the correct user. The server's webhook endpoint will also print incoming webhook events to the console.

If you open the React app in your browser by navigating to [http://localhost:8090](http://localhost:8090), you can go through the Utility Connect flow and enter utility credentials.

But how do we start getting utility data from the Arcadia API after a user submits their utility credentials? We'll need to set up webhooks for exactly this purpose.

## Webhooks
Let's set up webhooks so that after credentials are submitted via Utility Connect, we can start receiving account-related data. Webhooks allow us to receive data when it's available, rather than constantly polling the server.

### ngrok

In order to receive webhooks, we have to enable public HTTP requests to be received by our private, local development server. Our project is not publicly accessible to the internet because our server is just a local server running on `localhost:3010`, but we can use a tool like [ngrok](https://ngrok.com/) to get a public HTTP endpoint for our local server.

`ngrok` is a tool that forwards web traffic (ie Arcadia webhooks) from a public HTTP address to your local machine. You can install ngrok with:

```.sh
npm install ngrok -g
```

Note: You will not need to use `ngrok` in a production environment. It's just used when running a local, non-public development environment like this one.

The server of our example project is set up to run on port 3010, so to connect a public IP address to the server, in a new terminal window run:

```.sh
ngrok http 3010
```

`ngrok` will print the forwarding URL that the tunnel is exposed at -- something like `https://197286121879.ngrok.io`). `ngrok` should also indicate that it's tunneling data to `localhost:3010`. In a new terminal window (so as to not abort the `ngrok` session), save the URL to an environment variable for easier use with `curl` in the subsequent steps:

```.sh
ARCADIA_TUNNELING_URL=<https URL from ngrok>
```

### Webhook Access Token

Now that we have public traffic routed to the port that our server will run on, the next step is to request an Access Token that you can use to register your webhook URIs. The [webhook section](https://developers.arcadia.com/#tag/Webhooks) describes the RESTful Arcadia API endpoints for managing your webhook URIs. For the purposes of this walkthrough, we'll use `curl` to make HTTP requests to those API endpoints.

To request an Access Token, we'll load the API Keys into our shell environment and then send a request to the webhooks endpoint:

```.sh
source .env
```
```.sh
curl -i -X POST https://sandbox.api.arcadia.com/auth/access_token \
  -F "client_id=$ARCADIA_API_CLIENT_ID" \
  -F "client_secret=$ARCADIA_API_CLIENT_SECRET"
```

Your response should look something like this:
```
HTTP/2 200
date: Wed, 26 May 2021 22:10:32 GMT
content-type: application/json; charset=utf-8
content-length: 142
x-frame-options: ALLOWALL
cache-control: private, no-store
pragma: no-cache
etag: W/"2936966eeb8a0c0896610ede6dc6f015"
x-request-id: 973379cc-6183-470f-ab96-777fda13c9bd
x-runtime: 0.360905
x-amzn-trace-id: Root=1-60aec757-21d4794f6c91c82269602213
vary: Origin

{"access_token":"YOUR_ARCADIA_ACCESS_TOKEN","token_type":"Bearer","expires_in":7200,"scope":"write","created_at":1622067032}%
```

Save your Access Token to an environment variable so you don't have to keep copying and pasting across `curl` commands:

```.sh
ARCADIA_ACCESS_TOKEN=<access_token from last response>
```

### Webhook Registration
Now we have the Access Token to register a webhook and the `ngrok` base URL that the webhooks will be sent to.

The backend we started up is designed to print out data received at the [`/webhook_listener` path](https://github.com/ArcadiaPower/platform-quickstart/blob/main/server/index.js#L62). For the local server to receive the webhook, we need to register the URL with the Arcadia API:

```.sh
curl -i -X POST https://sandbox.api.arcadia.com/webhook/endpoints \
  -H "Authorization: Bearer $ARCADIA_ACCESS_TOKEN" \
  -d "url=$ARCADIA_TUNNELING_URL/webhook_listener"
```

Your response should look something like this:
```.sh
HTTP/2 200
date: Thu, 27 May 2021 00:57:07 GMT
content-type: application/json; charset=utf-8
content-length: 190
x-frame-options: ALLOWALL
etag: W/"e525d19319fb4157b672cbbcfcd96630"
cache-control: max-age=0, private, must-revalidate
x-request-id: f68888b9-e34d-486e-996f-a51770a77fda
x-runtime: 0.025782
x-amzn-trace-id: Root=1-60aeee63-225b188311ad903f1c41b343
vary: Origin

{"id":"YOUR_WEBHOOK_ID","url":"ARCADIA_TUNNELING_URL/webhook_listener","signing_key":"ARCADIA_WEBHOOK_SIGNING_KEY","created_at":"2021-05-26T20:57:07.239-04:00","updated_at":"2021-05-26T20:57:07.239-04:00"}
```

Now let's save the webhook ID to an environment variable for ease of access in subsequent commands:

```.sh
ARCADIA_WEBHOOK_ID=<id from last response>
```

We should also copy the value from the `signing_key` field in the response to `.env` in order to set the `ARCADIA_WEBHOOK_SIGNING_KEY` environment variable. **Note that if your server is still running, it will need to be stopped and started again to pick up this change.**

Your registered webhook endpoint is only valid as long as your ngrok session is active. Note that if you terminate your `ngrok` session, or if your session expires after the default limit of 2 hours, you will need to re-run the `ngrok` command and register a new webhook.

### Webhook Test

Now that we've registered our webhook URI, let's fire the [Test Webhook Event](https://developers.arcadia.com/#operation/requestWebookTestEvent) to make sure everything is wired up.

If you have closed the server from the beginning of the walkthrough, start it up again:
```.sh
npm start
```

Use the [webhook test endpoint](https://developers.arcadia.com/#operation/testWebhook) to trigger a test webhook from Arcadia:
```.sh
curl -i -X PUT https://sandbox.api.arcadia.com/webhook/endpoints/$ARCADIA_WEBHOOK_ID/test \
    -H "Authorization: Bearer $ARCADIA_ACCESS_TOKEN"
```

Your response should look something like this:
```.sh
HTTP/2 202
date: Thu, 27 May 2021 01:08:48 GMT
content-type: text/html
content-length: 0
x-frame-options: ALLOWALL
cache-control: no-cache
x-request-id: cb16484e-ea0d-45a8-aea2-0cb28b2501c6
x-runtime: 0.106986
x-amzn-trace-id: Root=1-60aef120-728936b118f59fb003e2b693
vary: Origin
```

In the console window in which you ran `npm start`, you should see the console update when the test webhook is received:
```.sh
Received a webhook with data:  {
    type: 'test',
    created_at: '2021-05-21T18:59:39.459-04:00',
    data: {}
}
```

Great, we're all set up to start receiving data!

## React App: Generate Real Webhooks With Real Credentials

Open up your browser to the React app at [http://localhost:8090](http://localhost:8090). Refresh the page if you already went through the Utility Connect flow in order to reset the example app.

Go through the Utility Connect flow. You can submit [Arcadia-defined test credentials](https://developers.arcadia.com/#section/Authentication/Utility-Connect) with a username of `ARCADIA_TEST_R_SINGLE_ELEC	` and a password of `verified` or you can use credentials associated with a real utility account. After you submit utility credentials, return to your console and watch the stream of webhook events roll in.

You should see a [`utility_credential_verified`](https://developers.arcadia.com/#operation/utilityCredentialVerified) webhook event fired within a few seconds that contains information about the submitted [UtilityCredential](https://developers.arcadia.com/#tag/UtilityCredential). A [`utility_accounts_discovered`](https://developers.arcadia.com/#operation/utilityAccountsDiscovered) webhook event should be fired shortly after that includes all the user's utility account data. Finally, after a minute or two, you'll receive a `historical_utility_statements_discovered` webhook that contains all of the existing statements we were able to collect for each account.


## Digging Deeper

That concludes the basic platform quickstart! Explore our [Developer Platform API](https://developers.arcadia.com/) for more capabilities, or look at our [utility-connect-react](https://github.com/ArcadiaPower/utility-connect-react/) project for instructions on how to embed Utility Connect in your own application.


There are two primary source code files that do most of the heavy lifting in this example application. Explore these files to get a deeper understanding of how to incorporate Utility Connect and webhooks into your project:

1. The [implementation of Utility Connect](./src/utility-connect-widget.jsx): this requests a Utility Connect Token from the server, configures Utility Connect, and manages frontend state throughout the component lifecycle.

2. The [backend server](./server/index.js): this server fetches Utility Connect Tokens on behalf of Utility Connect and logs payload JSON to the console as webhooks are received.
