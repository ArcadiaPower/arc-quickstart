import { useState } from 'react';
import JSONPretty from 'react-json-pretty';
import { calculateCounterfactualBill } from "../session.js";
import CounterfactualResults from './counterfactual-results.jsx';
import { object } from 'prop-types';
import Modal from 'react-modal';

const containerStyle = {
  display: "flex",
  gap: '20px',
}

const titleStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: 'center'
}

Modal.setAppElement(document.getElementById('root'));

const UtilityStatementElement = ({ arcUtilityStatement }) => {
  const [openModal, setOpenModal] = useState(false)
  const [counterFactualResults, setCounterFactualResults] = useState()

  const calculate = async (arcUtilityStatementId) => {
    setOpenModal(true)
    const result = await calculateCounterfactualBill(arcUtilityStatementId)
    setCounterFactualResults(result)
  }

  const closeModal = () => {
    setOpenModal(false)
  }

  return (
    <div>
      <JSONPretty id="json-pretty" data={arcUtilityStatement}></JSONPretty>
      <button onClick={() => calculate(arcUtilityStatement.id)}>
        Calculate Counterfactual Bill for Arc Utility Statement {arcUtilityStatement.id}
      </button>
      <Modal isOpen={openModal} appElement={document.getElementById('app')}>
        <div style={titleStyle}>
          <h3>Counterfactual Bill for Arc Utility Statement {arcUtilityStatement.id}</h3>
          <button onClick={closeModal}>close</button>
        </div>
        <>
          {
            counterFactualResults ? <div style={containerStyle}>
              <CounterfactualResults title="Current Cost" results={counterFactualResults.currentCost}></CounterfactualResults>
              <CounterfactualResults title="Current Cost Without Solar" results={counterFactualResults.currentCostWithoutSolar}></CounterfactualResults>
            </div>
              : <p>Loading...</p>
          }
        </>
      </Modal>
    </div>
  )
};

UtilityStatementElement.propTypes = {
  arcUtilityStatement: object.isRequired
};


export default UtilityStatementElement;
