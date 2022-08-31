import { useState, useEffect } from 'react';
import { fetchUtilityStatements } from "../session.js";
import UtilityStatementElement from "./utility-statement-element.jsx";
import { string } from 'prop-types';

const UtilityStatementsDisplay = ({arcUtilityAccountId, setError, error}) => {
  const [arcUtilityStatements, setArcUtilityStatements] = useState()

  const setUtilityStatements = async () => {
    try{
      const result = await fetchUtilityStatements(arcUtilityAccountId);
      setArcUtilityStatements(result)
    } catch (error) {
      console.log(error);
      setError(error.response)
    }

  };

  // Clear the current Utility Statements if the user re-enters a arcUtilityAccountId
  useEffect(() => {
    setArcUtilityStatements(null)
    setError(null)
  }, [arcUtilityAccountId]);

  return (
    <div>
      <h3> Next, we will fetch the utility statements for the Arc Utility Account from Plug</h3>
      <button onClick={setUtilityStatements}>
        Fetch Utility Statements for Utility Account {arcUtilityAccountId}
      </button>
      {arcUtilityStatements &&
        arcUtilityStatements.data.map(utilityStatement => {
          return(
           <UtilityStatementElement key={utilityStatement.id} arcUtilityStatement={utilityStatement}/>
          )
        })
      }
    </div>
  )
};

UtilityStatementsDisplay.propTypes = {
  arcUtilityAccountId: string.isRequired
};


export default UtilityStatementsDisplay;
