import React, { useState } from 'react';
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
  fraction,
  onFractionChange,
  selectedWords,
  onWordSelect,
  onWordHide,
  hiddenWords,
  onlySelectedWords,
  onOnlySelectedWordsChange,
  onAddCustomWord
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`right-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        {isCollapsed ? '>' : '<'}
      </button>
      <div className="panel-content">
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
          onAddCustomWord={onAddCustomWord}
        />
        <div className="panel-section">
          <Config 
            timeout={timeout} 
            onTimeoutChange={onTimeoutChange}
            marbleSize={marbleSize}
            onMarbleSizeChange={onMarbleSizeChange}
            fadeEnabled={fadeEnabled}
            onFadeChange={onFadeChange}
            fraction={fraction}
            onFractionChange={onFractionChange}
            onlySelectedWords={onlySelectedWords}
            onOnlySelectedWordsChange={onOnlySelectedWordsChange}
          />
        </div>
      </div>
    </div>
  );
}

export default RightPanel;
