import React from 'react';
import ReactDOM from 'react-dom';
import { createGenabilityAccount} from './session.js'

ReactDOM.render(
  <React.StrictMode>
    <h1> Hello Cruel World </h1>
    <button type="button" onClick={() => createGenabilityAccount(2411694)}>
      Create a Genability Switch Profile
    </button>
  </React.StrictMode>,
  document.getElementById('root')
);
