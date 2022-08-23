import { useState } from 'react';
import { fetchUtilityStatements } from "../session.js";
import { number } from 'prop-types';
import JSONPretty from 'react-json-pretty';

const UtilityStatementsDisplay = ({arcUtilityAccountId}) => {
  const [arcUtilityStatements, setArcUtilityStatements] = useState()

  const setUtilityStatements = async () => {
    const result = await fetchUtilityStatements(arcUtilityAccountId);
    setArcUtilityStatements(result)
  };

  const calculateCounterFactualBill = () => {
    console.log("Implement me please")
  }

  return (
    <div>
      <button onClick={setUtilityStatements}>
        Fetch Utility Statements for Utility Account {arcUtilityAccountId}
      </button>
      {arcUtilityStatements && 
        arcUtilityStatements.data.map(utilityStatement => {
          return(
            <div> 
              <JSONPretty id="json-pretty" data={utilityStatement}></JSONPretty>
              <button onClick={calculateCounterFactualBill}>
                Calculate Counterfactual Bill for Arc Utility Statement {utilityStatement.id}
              </button>
            </div> 
          )
        })
      }
    </div>
  )
};

UtilityStatementsDisplay.propTypes = {
  arcUtilityAccountId: number.isRequired
};


export default UtilityStatementsDisplay;