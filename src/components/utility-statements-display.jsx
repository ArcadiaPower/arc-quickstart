import { useState } from 'react';
import { fetchUtilityStatements } from "../session.js";
import UtilityStatementElement from "./utility-statement-element.jsx";
import { number } from 'prop-types';

const UtilityStatementsDisplay = ({arcUtilityAccountId}) => {
  const [arcUtilityStatements, setArcUtilityStatements] = useState()
  const [openModal, setOpenModal] = useState(false)

  const setUtilityStatements = async () => {
    const result = await fetchUtilityStatements(arcUtilityAccountId);
    setArcUtilityStatements(result)
  };


  return (
    <div>
      <h3> Next, we will fetch the utility statements for the Arc Utility Account from Plug</h3>
      <button onClick={setUtilityStatements}>
        Fetch Utility Statements for Utility Account {arcUtilityAccountId}
      </button>
      {arcUtilityStatements && 
        arcUtilityStatements.data.map(utilityStatement => {
          return(
           <UtilityStatementElement arcUtilityStatement={utilityStatement}/>
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