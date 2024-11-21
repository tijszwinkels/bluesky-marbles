import React from 'react';

function Config({ timeout, onTimeoutChange, marbleSize, onMarbleSizeChange }) {
  const handleTimeoutSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onTimeoutChange(value);
  };

  const handleTimeoutInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 300) {
      onTimeoutChange(value);
    }
  };

  const handleMarbleSizeSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    onMarbleSizeChange(value);
  };

  const handleMarbleSizeInputChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.1 && value <= 2.0) {
      onMarbleSizeChange(value);
    }
  };

  return (
    <div className="config-container">
      <div className="config-item">
        <label>Marble Timeout (seconds)</label>
        <div className="config-controls">
          <input
            type="range"
            min="1"
            max="300"
            value={timeout}
            onChange={handleTimeoutSliderChange}
            className="config-slider"
          />
          <input
            type="number"
            min="1"
            max="300"
            value={timeout}
            onChange={handleTimeoutInputChange}
            className="config-input"
          />
        </div>
      </div>
      <div className="config-item">
        <label>Marble Size</label>
        <div className="config-controls">
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={marbleSize}
            onChange={handleMarbleSizeSliderChange}
            className="config-slider"
          />
          <input
            type="number"
            min="0.1"
            max="2.0"
            step="0.1"
            value={marbleSize}
            onChange={handleMarbleSizeInputChange}
            className="config-input"
          />
        </div>
      </div>
    </div>
  );
}

export default Config;
