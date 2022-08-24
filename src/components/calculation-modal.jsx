import React from "react";
import { func } from 'prop-types';

const CalculationModal = ({ setOpenModal }) => {
  return (
    <p>this will be a modal eventually...</p>
  );
}

CalculationModal.propTypes = {
  setOpenModal: func.isRequired
};

export default CalculationModal;
