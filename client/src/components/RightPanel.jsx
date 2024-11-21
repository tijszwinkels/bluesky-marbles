import React from 'react';
import Stats from './Stats';
import Config from './Config';
import './RightPanel.css';

function RightPanel({ 
  stats, 
  timeout, 
  onTimeoutChange, 
  marbleSize, 
  onMarbleSizeChange,
  fadeEnabled,
  onFadeChange
}) {
  return (
    <div className="right-panel">
      <div className="panel-section">
        <h3>Statistics</h3>
        <Stats stats={stats} />
      </div>
      <div className="panel-section">
        <Config 
          timeout={timeout} 
          onTimeoutChange={onTimeoutChange}
          marbleSize={marbleSize}
          onMarbleSizeChange={onMarbleSizeChange}
          fadeEnabled={fadeEnabled}
          onFadeChange={onFadeChange}
        />
      </div>
    </div>
  );
}

export default RightPanel;
