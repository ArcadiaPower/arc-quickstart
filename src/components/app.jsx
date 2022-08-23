import { useState } from 'react';
import { createGenabilityAccount } from "../session.js";
import JSONPretty from 'react-json-pretty';
import UtilityStatementsDisplay from "./utility-statements-display.jsx";

const App = () => {
  const [arcUtilityAccountId, setArcUtilityAccountId] = useState('');
  const [genabilityAccount, setGenabilityAccount] = useState()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createGenabilityAccount(arcUtilityAccountId);
    setGenabilityAccount(result)
  };

  return (
    <div>
      <h3> First, let's create a Genability Account for an Arc Utility Account in your Sandbox environment. </h3>
      <form onSubmit={handleSubmit}>
        <label>
          Arc Utility Account Id: 
          <input 
            type="text" 
            name="Arc Utility Account Id" 
            onChange={e => setArcUtilityAccountId(e.target.value)} 
            value={arcUtilityAccountId}/>
        </label>
        <input type="submit" value="Submit"/>
      </form>
      { genabilityAccount && <JSONPretty id="json-pretty" data={genabilityAccount}></JSONPretty> }
      { genabilityAccount && 
        <div>
          <h3> Next, let's fetch the utility statements for the Arc Utility Account from Plug</h3>
          <UtilityStatementsDisplay arcUtilityAccountId={arcUtilityAccountId}/>
        </div>
      }
    </div>
  )
};

export default App;