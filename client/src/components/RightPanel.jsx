import React from 'react';
import Stats from './Stats';
import Config from './Config';

function RightPanel({ 
  stats, 
  timeout, 
  onTimeoutChange, 
  marbleSize, 
  onMarbleSizeChange 
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
        />
      </div>
    </div>
  );
}

export default RightPanel;
