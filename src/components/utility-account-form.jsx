import { createGenabilityAccount } from "../session.js";
import JSONPretty from 'react-json-pretty';
import { func, string } from 'prop-types';

const UtilityAccountForm = ({arcUtilityAccountId, setArcUtilityAccountId, genabilityAccount, setGenabilityAccount}) => {
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
    </div>
  )
};

UtilityAccountForm.propTypes = {
  arcUtilityAccountId: string.isRequired,
  setArcUtilityAccountId: func.isRequired,
  genabilityAccount:  string,
  setGenabilityAccount: func.isRequired
};

export default UtilityAccountForm;