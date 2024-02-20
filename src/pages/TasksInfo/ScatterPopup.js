import React, { useState, useRef } from 'react';
import Plot from 'react-plotly.js';

const ScatterPopup = ({ plotData, plotConfig, onClose }) => {
  return (
    <div className="popup">
      <div className="popup-content-scatter">
        <button className= "close-button-scatter" onClick={onClose}>
          <b>X</b>
        </button>
        <Plot data={plotData} config={plotConfig} layout={{ autosize: true}} />
      </div>
    </div>
  );
};

export default ScatterPopup;