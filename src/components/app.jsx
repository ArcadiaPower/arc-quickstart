import { useState } from 'react';
import UtilityAccountForm from "./utility-account-form.jsx";
import UtilityStatementsDisplay from "./utility-statements-display.jsx";
import ErrorMessage from './error-message.jsx';

const App = () => {
  const [arcUtilityAccountId, setArcUtilityAccountId] = useState('');
  const [genabilityAccount, setGenabilityAccount] = useState()
  const [error, setError] = useState()

  return (
    <div>
      <UtilityAccountForm
        setArcUtilityAccountId={setArcUtilityAccountId}
        arcUtilityAccountId={arcUtilityAccountId}
        setGenabilityAccount={setGenabilityAccount}
        genabilityAccount={genabilityAccount}
        setError={setError}
        error={error}
      />
      { genabilityAccount &&
        <UtilityStatementsDisplay arcUtilityAccountId={arcUtilityAccountId} setError={setError} error={error}/>
      }
      {
        error &&
          <ErrorMessage error={error}/>
      }
    </div>
  )
};

export default App;
