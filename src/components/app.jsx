import { useState } from 'react';
import UtilityAccountForm from "./utility-account-form.jsx";
import UtilityStatementsDisplay from "./utility-statements-display.jsx";
import JSONPretty from 'react-json-pretty';

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
          <JSONPretty data={error} stringStyle="white-space: normal" style={{backgroundColor: '#FFCCCC'}}></JSONPretty>
      }
    </div>
  )
};

export default App;
