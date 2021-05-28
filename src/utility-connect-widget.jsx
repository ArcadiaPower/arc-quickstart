import React, { useEffect, useState } from 'react';
import { useUtilityConnect } from '@arcadia-eng/utility-connect-react';
import { getComponentToken } from './session';

const UtilityConnectWidget = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [successful, setSuccessful] = useState(false);
  const [error, setError] = useState(null);
  const [timedOut,  setTimedOut] = useState(false);
  const [userId, setUserId] = useState(null);

  // This is the hook for the Utility Connect Component
  const [{ loading, utilityConnectSetupError }, open] = useUtilityConnect();

  if (utilityConnectSetupError) {
    setError(utilityConnectSetupError.message);
  }

  // The first time this Component renders, we ask the server to fetch an OAuth token from the Arcadia API
  useEffect(() => {
    getComponentToken()
      .then(token => {
        // We configure the Component using the OAuth token and some details about the user (hardcoded below)
        setConfig(generateConfig(token))
      })
      .catch((e) => {
        setError(e.message);
      });
  }, []);

  const generateConfig = token => {
    const timestamp = new Date().getTime();
  
    return {
      accessToken: token,
      env: 'sandbox',
      client: 'Arcadia Node Walkthrough',
      data: {
        user: {
          address: '123 Renewables Way',
          email: `test-user-${timestamp}@example.com`,
          firstName: 'Test',
          lastName: 'Test',
        },
      },
      callbacks: {
        // Called each time the Utility Connect Component is opened.
        onOpen: () => {
          setModalOpen(true);
        },
        // Called each time the Utility Connect Component is closed.
        onClose: () => {
          setModalOpen(false);
        },
        // Called when a user submits their credentials and those credentials are verified during the regular course of the Component's user experience
        onSuccess: ( { data }) => {
          // Associate data.user_id to the user in your system
          setUserId(data.userId);
          setSuccessful(true);
          
        },
        // Called when a user submits their credentials but they could not be verified in a reasonable amount of time before the Component redirected the user back to your app. Credentials will still be verified in the background
        // but if your receive a UtilityCredentialRejected webhook, you'll need to prompt this user to enter the Utility Connect process again.
        onTimeout: ( { data } ) => {
          // Associate data.user_id to the user in your system
          setUserId(data.userId);
          setSuccessful(true);
          setTimedOut(true);
        },
        // Called if there was a catastrophic error when submitting the user's credential
        onError: ({ error }) => {
          setError(error);
        },
      },
      poll: {
        timeout: 30000,
      },
      uiTheme: 'dark',
    };
  };

  if (modalOpen) return null;

  if (error) {
    return <p>Uh oh! We hit a problem: {error} </p>;
  }

  if (timedOut) {
    return <p>User #{userId} was created but their credentials weren't verified before the Component timed out and closed. The credentials will be verified in the background. If you've configured a webhook, check your console for incoming webhooks about verification.</p>
  }

  if (successful) {
    return <p>You have connected the account for User #{userId}! If you've configured a webhook, check your console for incoming data.</p>
  }

  return (
    // When the button is clicked, we call the Utility Connect Component's open method in order to display the modal
    <button type="button" disabled={loading || !config} onClick={() => open(config)}>
      Launch Utility Connect Component
    </button>
  );
};

export default UtilityConnectWidget;
