import React from 'react';
import './Config.css';

function Config({ 
  timeout, 
  onTimeoutChange, 
  marbleSize, 
  onMarbleSizeChange,
  fadeEnabled,
  onFadeChange
}) {
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

  const handleFadeChange = (e) => {
    onFadeChange(e.target.checked);
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
      <div className="config-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fadeEnabled}
            onChange={handleFadeChange}
            className="config-checkbox"
          />
          Enable Fade Effect
        </label>
      </div>
    </div>
  );
}

export default Config;
