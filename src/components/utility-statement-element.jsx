import { useState } from 'react';
import JSONPretty from 'react-json-pretty';
import { string } from 'prop-types';
import CalculationModal from './calculation-modal.jsx'

const UtilityStatementElement = ({arcUtilityStatement}) => {
  const [openModal, setOpenModal] = useState(false)

  const calculateCounterFactualBill = () => {
    setOpenModal(true)
    console.log("Implement me please")
  }

  return (
    <div> 
      <JSONPretty id="json-pretty" data={arcUtilityStatement}></JSONPretty>
      <button onClick={calculateCounterFactualBill}>
        Calculate Counterfactual Bill for Arc Utility Statement {arcUtilityStatement.id}
      </button>
      {openModal && <CalculationModal/>}
    </div> 
  )
};

UtilityStatementElement.propTypes = {
  arcUtilityStatement: string.isRequired
};


export default UtilityStatementElement;