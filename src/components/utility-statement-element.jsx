import { useState } from 'react';
import JSONPretty from 'react-json-pretty';
import { calculateCounterfactualBill } from "../session.js";
import { object } from 'prop-types';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const resultStyle = {
  width: "50%",
  overflow: "hidden"
}

const containerStyle = {
  display: "flex",
  gap: '20px'
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
        <button onClick={closeModal}>close</button>
        <>
          {
            counterFactualResults ? <div style={containerStyle}>
            <div style={resultStyle}>
              Current Cost:
              <JSONPretty stringStyle='white-space: normal' data={counterFactualResults.currentCost}></JSONPretty>
            </div>
            <div style={resultStyle}>
              Current Cost Without Solar:
              <JSONPretty stringStyle='white-space: normal' data={counterFactualResults.currentCostWithoutSolar}></JSONPretty>
            </div>
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
