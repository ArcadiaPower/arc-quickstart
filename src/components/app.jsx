import { useState } from 'react';
import UtilityAccountForm from "./utility-account-form.jsx";
import UtilityStatementsDisplay from "./utility-statements-display.jsx";

const App = () => {
  const [arcUtilityAccountId, setArcUtilityAccountId] = useState('');
  const [genabilityAccount, setGenabilityAccount] = useState()

  return (
    <div>
      <UtilityAccountForm 
        setArcUtilityAccountId={setArcUtilityAccountId}
        arcUtilityAccountId={arcUtilityAccountId}
        setGenabilityAccount={setGenabilityAccount} 
        genabilityAccount={genabilityAccount}
      />
      { genabilityAccount && 
        <UtilityStatementsDisplay arcUtilityAccountId={arcUtilityAccountId}/>
      }
    </div>
  )
};

export default App;