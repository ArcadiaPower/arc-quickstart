This project demonstrates how to use Arcadia's [connect-react](https://github.com/ArcadiaPower/connect-react/) component in an example integration against the [Arc Platform API](http://developers.arcadia.com).

# Arcadia's Arc Quickstart

This example application will load a React web app where you can enter utility credentials. The data related to the utility account will be delivered to your terminal via webhooks.

You'll need your Arcadia API keys, a computer that can run Node.js version 14.x, and familiarity with the command line.

### Steps

1. [Configure Quickstart](#1-configure-quickstart)
2. [Set up your API Keys](#2-set-up-your-api-keys)
3. [Use ngrok to create a public HTTPS endpoint](#3-use-ngrok-to-create-a-public-https-endpoint)
4. [Create a webhook endpoint](#4-create-a-webhook-endpoint)
5. [Test your webhook endpoint](#5-test-your-webhook-endpoint)
6. [Generate real webhook events](#6-generate-real-webhook-events)

Additional Information: [Digging Deeper](#digging-deeper)

## 1. Configure Quickstart

The first step is to clone this example application. Use `git` to download the repository:

```.sh
git clone https://github.com/ArcadiaPower/arc-quickstart.git
```

Next, ensure you're using Node.js version 14.x (and NPM version 6.x). The easiest way to do that is by using `nvm` within the project directory (if you don't already have `nvm` installed, see [installation instructions here](https://github.com/nvm-sh/nvm#installing-and-updating)):

```.sh
cd arc-quickstart && nvm use
```

Now install the project's dependencies:

```.sh
npm run build
```

## 2. Set up your API Keys

Next, create a `.env` file from the template:

```.sh
cp .env-example .env
```

Open it and fill in your Arcadia `ARC_API_CLIENT_ID` and `ARC_API_CLIENT_SECRET`. Both can be found in your dashboard on the [**API keys** tab of the **Configuration** page](https://arc.arcadia.com/configuration/api-keys).
Leave `ARC_WEBHOOK_SIGNING_KEY` as is for now-- we'll come back to it.

Let's run the React web app and Node server so we can see this demo application in action.

```.sh
npm start
```

This command will concurrently start:

1. A React web app using [connect-react](https://github.com/ArcadiaPower/connect-react/) to integrate with Arc Connect.
2. An example backend [server](./server/index.js) that calls the Arcadia API to create Connect Tokens.

Connect Tokens are used to instantiate Connect and scope data to your user. To see the demo, navigate to [http://localhost:8090](http://localhost:8090). You can click the **Launch Connect** button to try out the flow.

What's next after a user enters their credentials through Connect? You likely want to see the data for this user. We can set up webhooks to get this data in real time.

## 3. Use ngrok to create a public HTTPS endpoint

Rather than constantly polling the Arc server, setting up webhook endpoints allows us to receive data through Arc webhooks as that data becomes available. When using Connect in your production environment, the webhook endpoint URLs you will register are your API endpoints at which you want to receive webhook data from Arc.

For the sake of Quickstart, let's set up a webhook endpoint so we can start receiving utility account data for a user that went through the Connect flow. In order to receive webhooks, we have to enable public HTTP requests to be received by our private, local development server. Our project is not publicly accessible to the internet because our server is running locally at `localhost:3010`. However, we can use a tool like [ngrok](https://ngrok.com/) to get a public HTTP endpoint for our local server.

`ngrok` is a tool that forwards web traffic (ie Arcadia webhooks) from a public HTTP address to your local machine. You can install ngrok from your terminal with:

```.sh
npm install ngrok -g
```

Note: You will not need to use `ngrok` in a production environment. This is merely a tool for receiving webhooks on your personal machine.

The server of our example project is set up to run on port 3010, so to connect a public IP address to the server, in a new terminal window run:

```.sh
ngrok http 3010
```

`ngrok` will print the forwarding URL that the tunnel is exposed at -- something like `https://197286121879.ngrok.io`.The response should also indicate that `ngrok` is tunneling data to `localhost:3010`. Make sure you keep this terminal open thorughout the quickstart flow so that you don't abort the `ngrok` session.

## 4. Create a webhook endpoint

We're now going to create a new webhook endpoint using the `ngrok` URL.

On your Arc dashboard, go to the [**Webhooks** tab of the **Configuration** page](https://arc.arcadia.com/configuration/webhooks). We need to create a sandboxed endpoint-- click the toggle on the page to switch the environment from **Live endpoints** to **Sandbox endpoints**.

Click the **New endpoint** button and paste in the `https` forwarding URL that was returned by `ngrok`. Before saving the endpoint, append `/webhook_listener` to the end. For instance, the example URL from above should be saved as `https://197286121879.ngrok.io/webhook_listener`.

Once you save the endpoint, it will appear in the dashboard with an ID and Signing key. Copy the **Signing key** and paste it into the `.env` file as the `ARC_WEBHOOK_SIGNING_KEY` environment variable. **Note that if your server is still running, it will need to be stopped and started again to pick up this change.**

Your registered webhook endpoint is only valid as long as your ngrok session is active. Note that if you terminate your `ngrok` session, or if your session expires after the default limit of 2 hours, you will need to re-run the `ngrok` command and register a new webhook.

## 5. Test your webhook endpoint

Now that we've registered our webhook URI, let's fire the [Test Webhook Event](https://developers.arcadia.com/#operation/requestWebookTestEvent) to make sure everything is wired up.

Re-start your server from the beginning of the walkthrough:

```.sh
npm start
```

You will notice that the endpoint you just created in the Arc dashboard has a **Test** button. Click the button and then check the console window in which you ran `npm start`. You should see the console update when the test webhook event is received:

```.sh
Received a webhook with data:  {
    type: 'test',
    created_at: '2021-05-21T18:59:39.459-04:00',
    data: {}
}
```

If you did not receive the test event, double-check that:

- The ngrok session is still running
- The endpoint is sandboxed, not live
- The endpoint is using the `https` ngrok address-- NOT the `http` address
- The endpoint ends in the address `/webhook_listener`
- The `ARC_API_CLIENT_ID`, `ARC_API_CLIENT_SECRET`, and `ARC_WEBHOOK_SIGNING_KEY` in your `.env` file are all correct

Great, we're all set up to start receiving webhook data!

## 6. Generate real webhook events

Open up your browser to the React app at [http://localhost:8090](http://localhost:8090). Refresh the page if you already went through the Connect flow in order to reset the example app.

Go through the Connect flow. You can submit [Arcadia-defined test credentials](https://developers.arcadia.com/#section/Authentication/Utility-Connect) with a username of `ARC_TEST_R_SINGLE_ELEC ` and a password of `verified` or you can use utility credentials associated with a real utility account. After you submit utility credentials, return to your console and watch the stream of webhook events roll in.

You should see a [`utility_credential_verified`](https://developers.arcadia.com/#operation/utilityCredentialVerified) webhook event fired within seconds of submitting utility credentials. This webhook contains information about the submitted [UtilityCredential](https://developers.arcadia.com/#tag/UtilityCredential). A [`utility_accounts_discovered`](https://developers.arcadia.com/#operation/utilityAccountsDiscovered) webhook event should be fired shortly after. This webhook includes all the user's utility account data. Finally, after a minute or two, you'll receive a`historical_utility_statements_discovered` webhook for each utility account discovered. Theese webhooks will contain information on existing utility statements for an account.

Note: In order to resubmit the same utility credentials again, you'll need to delete any users associated with the utility credentials. For convenience, the front-end for this demo provides a button to delete a user after connection, However, you can always delete the user manually using the [delete user endpoint](https://developers.arcadia.com/#operation/deleteUser).

## Digging Deeper

That concludes the basic Arc Quickstart! Explore our [API documentation](https://developers.arcadia.com/) for more Arc capabilities. Checkout [connect-react](https://github.com/ArcadiaPower/connect-react/) for instructions on how to embed Connect into your own application.

There are two primary source code files that do most of the heavy lifting in this example application. Explore these files to get a deeper understanding of how to incorporate Connect and webhooks into your project:

1. The [implementation of Connect](./src/connect-widget.jsx): this requests a Connect Token from the server, configures Connect, and manages frontend state throughout the component lifecycle.

2. The [backend server](./server/index.js): this server fetches Connect Tokens on behalf of Connect and logs payload JSON to the console as webhooks are received.
