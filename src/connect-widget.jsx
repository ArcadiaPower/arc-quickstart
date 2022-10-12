import React, { useEffect, useState } from "react";
import { useConnect } from "@arcadia-eng/connect-react";
import { getConnectToken, deleteUser } from "./session";
import { ContentContainer, StyledButton } from "./styles";

const ConnectWidget = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [successful, setSuccessful] = useState(false);
  const [error, setError] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [utilityCredentialId, setUtilityCredentialId] = useState(null);

  // This is the hook for the Connect Component
  const [{ loading, connectSetupError }, open] = useConnect();

  const deleteUserAndReload = async () => {
    await deleteUser(() => window.location.reload(false));
  };

  if (connectSetupError) {
    setError(connectSetupError.message);
  }

  // The first time this Component renders, we ask the server to fetch a Connect Token from the Arcadia API
  useEffect(() => {
    getConnectToken()
      .then((connectToken) => {
        // We configure the Component using the Connect Token
        setConfig(generateConfig(connectToken));
      })
      .catch((e) => {
        setError(e.message);
      });
  }, []);

  const generateConfig = (connectToken) => {
    return {
      connectToken,
      callbacks: {
        // Called each time the Connect Component is opened.
        onOpen: () => {
          setModalOpen(true);
        },
        onCredentialsSubmitted: ({ utilityCredentialId }) => {
          setUtilityCredentialId(utilityCredentialId);
          setError(null);
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
          }

          setModalOpen(false);
        },
        // Called if there was a catastrophic error when submitting the user's credential
        onError: ({ error }) => {
          let errorMessage = error?.response?.data?.error ?? error.message;
          errorMessage =
            typeof errorMessage === "string"
              ? errorMessage
              : JSON.stringify(errorMessage);
          setError(errorMessage);
        },
      },
    };
  };

  return modalOpen && !loading ? null : (
    <ContentContainer>
      <h1>Arc Quickstart</h1>

      {successful && (
        <>
          <p>
            You have connected Utility Credential #{utilityCredentialId}! If
            you've configured a webhook, check your console for incoming data.
          </p>
          <p>
            In order to try connecting these same credentials, you must delete
            the user associated with the credentials first:
          </p>
        </>
      )}

      {timedOut && (
        <>
          <p>
            Utility Credential #{utilityCredentialId} was created but the
            credentials weren't verified before the Component timed out and
            closed. The credentials will be verified in the background. If
            you've configured a webhook, check your console for incoming
            webhooks about verification.
          </p>
          <p>
            In order to retry connecting these same credentials, you must delete
            the user associated with the credentials first:
          </p>
        </>
      )}

      {error && <p>Uh oh! We hit a problem: {error} </p>}

      {successful || timedOut ? (
        <StyledButton type="button" onClick={() => deleteUserAndReload()}>
          Delete User and Reload
        </StyledButton>
      ) : (
        <StyledButton
          type="button"
          disabled={loading || !config}
          onClick={() => {
            setModalOpen(true);
            open(config);
          }}
        >
          Launch Connect
        </StyledButton>
      )}

      {loading && <p>Loading...</p>}
    </ContentContainer>
  );
};

export default ConnectWidget;
