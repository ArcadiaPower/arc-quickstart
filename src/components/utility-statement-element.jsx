import { useState } from 'react';
import JSONPretty from 'react-json-pretty';
import { calculateCounterfactualBill } from "../session.js";
import { object } from 'prop-types';
import Modal from 'react-modal';
import CalculationModal from './calculation-modal.jsx'

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

const UtilityStatementElement = ({arcUtilityStatement}) => {
  const [openModal, setOpenModal] = useState(false)

  const calculate = async (arcUtilityStatementId) => {
    setOpenModal(true)
    const result = await calculateCounterfactualBill(arcUtilityStatementId)
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
      <Modal isOpen={openModal} style={customStyles}>
        <p> We will display the results here if the exist and present loading if they are loading</p>
        <button onClick={closeModal}>close</button>
      </Modal>
    </div>
  )
};

UtilityStatementElement.propTypes = {
  arcUtilityStatement: object.isRequired
};


export default UtilityStatementElement;
