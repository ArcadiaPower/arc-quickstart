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
      <Modal isOpen={openModal} style={customStyles} appElement={document.getElementById('app')}>
        <p> We will display the results here if the exist and present loading if they are loading</p>
        {counterFactualResults &&
          <>
            <p>Current Total Cost: {counterFactualResults.currentCost.totalCost}</p>
            <p>Total Cost w/o Solar: {counterFactualResults.currentCostWithoutSolar.totalCost}</p>
          </>
        }
        <button onClick={closeModal}>close</button>
      </Modal>
    </div>
  )
};

UtilityStatementElement.propTypes = {
  arcUtilityStatement: object.isRequired
};


export default UtilityStatementElement;
