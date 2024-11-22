import React from 'react';
import Stats from './Stats';
import Config from './Config';
import WordFrequency from './WordFrequency';
import './RightPanel.css';

function RightPanel({ 
  stats, 
  timeout, 
  onTimeoutChange, 
  marbleSize, 
  onMarbleSizeChange,
  fadeEnabled,
  onFadeChange,
  selectedWords,
  onWordSelect,
  onWordHide,
  hiddenWords
}) {
  return (
    <div className="right-panel">
      <div className="panel-section">
        <h3>Statistics</h3>
        <Stats stats={stats} />
      </div>
      <WordFrequency 
        wordFrequencies={stats.wordFrequencies || new Map()} 
        selectedWords={selectedWords}
        onWordSelect={onWordSelect}
        onWordHide={onWordHide}
        hiddenWords={hiddenWords}
      />
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
