import React, { useEffect, useState } from 'react';
import { useConnect } from '@arcadia-eng/connect-react';
import { getConnectToken, deleteUser } from './session';

const ConnectWidget = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [successful, setSuccessful] = useState(false);
  const [error, setError] = useState(null);
  const [timedOut,  setTimedOut] = useState(false);
  const [utilityCredentialId, setUtilityCredentialId] = useState(null);

  // This is the hook for the Connect Component
  const [{ loading, connectSetupError }, open] = useConnect();

  if (connectSetupError) {
    setError(connectSetupError.message);
  }

  // The first time this Component renders, we ask the server to fetch a Connect Token from the Arcadia API
  useEffect(() => {
    getConnectToken()
      .then(connectToken => {
        // We configure the Component using the Connect Token
        setConfig(generateConfig(connectToken));
      })
      .catch((e) => {
        setError(e.message);
      });
  }, []);

  const deleteUserAndReload = () => {
    deleteUser(() => window.location.reload(false));
  }

  const generateConfig = connectToken => {
    return {
      connectToken,
      env: 'sandbox',
      callbacks: {
        // Called each time the Connect Component is opened.
        onOpen: () => {
          setModalOpen(true);
        },
        onCredentialsSubmitted: ({ utilityCredentialId }) => {
          setUtilityCredentialId(utilityCredentialId);
        },
        // Called each time the Connect Component is closed.
        onClose: ({ status }) => {
          switch (status) {
            // A user submitted their credentials and those credentials were verified during the regular course of the Component's user experience
            case "verified":
              setSuccessful(true);
              break;
            // A user submitted their credentials but they could not be verified in a reasonable amount of time before the Component redirected the user back to your app.
            // Credentials will still be verified in the background, but if your receive a UtilityCredentialRejected webhook, you'll need to prompt this user to enter the Connect process again.
            case "timed_out":
              setSuccessful(true);
              setTimedOut(true);
              break;
            default:
              break;
          };

          setModalOpen(false);
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
    return <p>Utility Credential #{utilityCredentialId} was created but the credentials weren't verified before the Component timed out and closed. The credentials will be verified in the background. If you've configured a webhook, check your console for incoming webhooks about verification.</p>
  }

  if (successful) {
    return (
      <div>
        <p>You have connected Utility Credential #{utilityCredentialId}! If you've configured a webhook, check your console for incoming data.</p>
        <p>In order to try connecting these same credentials, you must delete the user associated with the credentials first:</p>
        <button type="button" onClick={() => deleteUserAndReload()}>
          Delete User and Reload
        </button>
      </div>
    )
  }

  return (
    // When the button is clicked, we call Connect's open method in order to display the modal
    <button type="button" disabled={loading || !config} onClick={() => open(config)}>
      Launch Connect
    </button>
  );
};

export default ConnectWidget;
