import React from 'react';

function Config({ timeout, onTimeoutChange }) {
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onTimeoutChange(value);
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 300) {
      onTimeoutChange(value);
    }
  };

  return (
    <div className="config-container">
      <h3>Configuration</h3>
      <div className="config-item">
        <label>Marble Timeout (seconds)</label>
        <div className="config-controls">
          <input
            type="range"
            min="1"
            max="300"
            value={timeout}
            onChange={handleSliderChange}
            className="config-slider"
          />
          <input
            type="number"
            min="1"
            max="300"
            value={timeout}
            onChange={handleInputChange}
            className="config-input"
          />
        </div>
      </div>
    </div>
  );
}

export default Config;
