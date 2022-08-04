This project demonstrates how to use Arcadia's [connect-react](https://github.com/ArcadiaPower/connect-react/) component in an example integration against the [Arc Platform API](http://developers.arcadia.com).

# Arcadia's Arc Quickstart

This example application will load a React web app where you can enter utility credentials. The data related to the utility account will be delivered to your terminal via webhooks.

You'll need your Arcadia API keys, a computer that can run Node.js version 14.x, and familiarity with the command line. You can find your API Keys in the [Arc Dashboard's Configuration tab](https://arc.arcadia.com/configuration/api-keys).


## Configuration

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

## API Keys

Next, create a `.env` file from the template:
```.sh
cp .env-example .env
```

Open it and fill in your Arcadia `ARC_API_CLIENT_ID` and `ARC_API_CLIENT_SECRET`. Leave `ARC_WEBHOOK_SIGNING_KEY` as is for now - we'll come back to it.

## Hello, World
Let's run the React web app and Node server so we can see this demo application in action.
```.sh
npm start
```

This command will concurrently start:

1. A React web app using [connect-react](https://github.com/ArcadiaPower/connect-react/) to integrate with Arc Connect
2. An example backend [server](./server/index.js) that calls the Arcadia API to create Connect Tokens. Connect Tokens are used to instantiate Connect and scope data to your user. To see the demo and go through the Connect flow navigate to [http://localhost:8090](http://localhost:8090).


What's next after a user enters their credentials through Connect? You likely want to see the data for this user. We can set up webhooks to get this data in real time.

## Webhooks
Let's set up webhooks so we can start receiving utility account related data after utility credentials are submitted via Connect. Rather than constantly polling the server, webhooks allow us to receive data as it becomes available.

### ngrok

In order to receive webhooks, we have to enable public HTTP requests to be received by our private, local development server. Our project is not publicly accessible to the internet because our server is running locally at `localhost:3010`. However, we can use a tool like [ngrok](https://ngrok.com/) to get a public HTTP endpoint for our local server.

`ngrok` is a tool that forwards web traffic (ie Arcadia webhooks) from a public HTTP address to your local machine. You can install ngrok with:

```.sh
npm install ngrok -g
```

Note: You will not need to use `ngrok` in a production environment. This is merely a tool for receiving webhooks on your personal machine.

The server of our example project is set up to run on port 3010, so to connect a public IP address to the server, in a new terminal window run:

```.sh
ngrok http 3010
```

`ngrok` will print the forwarding URL that the tunnel is exposed at -- something like `https://d4fc-24-46-193-173.ngrok.io`. `ngrok` should also indicate that it's tunneling data to `localhost:3010`. Copy the `ngrok` forwarding URL to your clipboard for use in setting up the webhook endpoint.

### Creating A Webhook Endpoint
You can create webhook endpoints [via Arc API requests](https://developers.arcadia.com/#tag/Webhooks/operation/createWebhook), but for convenience, we've created a [Webhook Endpoints tab of the Arc Dashboard](https://arc.arcadia.com/configuration/webhooks) (the page UI may have been updated slightly since this guide was written). 
<img width="1593" alt="Screen Shot 2022-08-04 at 12 44 45 PM (1)" src="https://user-images.githubusercontent.com/432909/182947145-f3077668-d025-476f-ba51-65dbecfa26ab.png">

Click the button to add a "New Webhook Endpoint". In the "Endpoint URL" field that appears, paste the `ngrok` forwarding URL and save the new webhook endpoint.
<img width="1634" alt="Screen Shot 2022-08-04 at 12 44 58 PM" src="https://user-images.githubusercontent.com/432909/182947469-6509d651-c0ef-449d-8042-7847af7f46bb.png">

Your new webhook endpoint is live! Copy the "Signing Key" that was created for this endpoint. Our server that accepts webhook packets will use this key to securely verify that the packet was truly from Arcadia.
<img width="1599" alt="Screen Shot 2022-08-04 at 12 45 14 PM" src="https://user-images.githubusercontent.com/432909/182947733-689d8cb4-f6d9-41f1-a7f0-8f263f8f2371.png">

Finally, paste the Singing Key value into the `ARC_WEBHOOK_SIGNING_KEY` variable of the `.env` file. That's it! We should be able to test our our setup to confirm we're receive utility data from Arc. 

**Note:**Your registered webhook endpoint is only valid as long as your ngrok session is active. If you terminate your `ngrok` session, or if your session expires after the default limit of 2 hours, you will need to re-run the `ngrok` command and register a new webhook. You can also delete your old webhook in the Arc Dashboard.

## React App: Generate Real Webhooks With Real Utility Credentials

If your server is still running from the beginning of the walkthrough, restart it so that it loads the webhook signing key in the `.env` file.

Then, open up your browser to the React app at [http://localhost:8090](http://localhost:8090). Refresh the page if you already went through the Connect flow in order to reset the example app.

Go through the Connect flow. You can submit [Arcadia-defined test credentials](https://developers.arcadia.com/#section/Authentication/Utility-Connect) with a username of `ARC_TEST_R_SINGLE_ELEC	` and a password of `verified` or you can use utility credentials associated with a real utility account. After you submit utility credentials, return to your console and watch the stream of webhook events roll in.

You should see a [`utility_credential_verified`](https://developers.arcadia.com/#operation/utilityCredentialVerified) webhook event fired within seconds of submitting utility credentials. This webhook contains information about the submitted [UtilityCredential](https://developers.arcadia.com/#tag/UtilityCredential). A [`utility_accounts_discovered`](https://developers.arcadia.com/#operation/utilityAccountsDiscovered) webhook event should be fired shortly after. This webhook includes all the user's utility account data. Finally, after a minute or two, you'll receive a`historical_utility_statements_discovered` webhook for each utility account discovered. Theese webhooks will contain information on existing utility statements for an account. If you submitted credentials at a utility that supports interval data, you'll also eventually receive a `historical_utility_intervals_discovered` webhook event.

Note: In order to resubmit the same utility credentials again, you'll need to delete any users associated with the utility credentials. For convenience, the front-end for this demo provides a button to delete a user after connection, However, you can always delete the user manually using the [delete user endpoint](https://developers.arcadia.com/#operation/deleteUser).


## Digging Deeper

That concludes the basic Arc Quickstart! Explore our [API documentation](https://developers.arcadia.com/) for more Arc capabilities. Checkout [connect-react](https://github.com/ArcadiaPower/connect-react/) for instructions on how to embed Connect into your own application.

There are two primary source code files that do most of the heavy lifting in this example application. Explore these files to get a deeper understanding of how to incorporate Connect and webhooks into your project:

1. The [implementation of Connect](./src/connect-widget.jsx): this requests a Connect Token from the server, configures Connect, and manages frontend state throughout the component lifecycle.

2. The [backend server](./server/index.js): this server fetches Connect Tokens on behalf of Connect and logs payload JSON to the console as webhooks are received.
