import { useState } from 'react';
import JSONPretty from 'react-json-pretty';
import { calculateCounterfactualBill } from "../session.js";
import { object } from 'prop-types';
import CalculationModal from './calculation-modal.jsx'

const UtilityStatementElement = ({arcUtilityStatement}) => {
  const [openModal, setOpenModal] = useState(false)

  const calculate = async (arcUtilityStatementId) => {
    const result = await calculateCounterfactualBill(arcUtilityStatementId)
    setOpenModal(true)
  }

  return (
    <div>
      <JSONPretty id="json-pretty" data={arcUtilityStatement}></JSONPretty>
      <button onClick={() => calculate(arcUtilityStatement.id)}>
        Calculate Counterfactual Bill for Arc Utility Statement {arcUtilityStatement.id}
      </button>
      {openModal && <CalculationModal setOpenModal={setOpenModal}/>}
    </div>
  )
};

UtilityStatementElement.propTypes = {
  arcUtilityStatement: object.isRequired
};


export default UtilityStatementElement;
