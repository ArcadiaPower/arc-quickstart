import React from "react";
import "./calculation-modal.css";
import { func } from 'prop-types';

const CalculationModal = ({ setOpenModal }) => {
  return (
    <p>this will be a modal eventually...</p>
    // <div className="modalBackground">
    //   <div className="modalContainer">
    //     <div className="titleCloseBtn">
    //       <button
    //         onClick={() => {
    //           setOpenModal(false);
    //         }}
    //       >
    //         X
    //       </button>
    //     </div>
    //     <div className="title">
    //       <h1>Are You Sure You Want to Continue?</h1>
    //     </div>
    //     <div className="body">
    //       <p>The next page looks amazing. Hope you want to go there!</p>
    //     </div>
    //     <div className="footer">
    //       <button
    //         onClick={() => {
    //           setOpenModal(false);
    //         }}
    //         id="cancelBtn"
    //       >
    //         Cancel
    //       </button>
    //       <button>Continue</button>
    //     </div>
    //   </div>
    // </div>
  );
}

CalculationModal.propTypes = {
  setOpenModal: func.isRequired
};


export default CalculationModal;