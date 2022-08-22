import React from "react";
import ReactDOM from "react-dom";
import {
  calculateCounterfactualBill,
  createGenabilityAccount,
  fetchUtilityStatements,
} from "./session.js";

ReactDOM.render(
  <React.StrictMode>
    <h1> Hello Cruel World </h1>
    <button type="button" onClick={() => createGenabilityAccount(2409150)}>
      Create a Genability Switch Profile for this Utility Account (may
      eventually be on meter level)
    </button>
    <br />
    <button type="button" onClick={() => fetchUtilityStatements(2409150)}>
      Fetch Utility Statements for this Utility Account
    </button>
    <br />
    <button type="button" onClick={() => calculateCounterfactualBill(17117642)}>
      Calculate Counterfactual Bill for this Utility Statement
    </button>
  </React.StrictMode>,
  document.getElementById("root")
);
