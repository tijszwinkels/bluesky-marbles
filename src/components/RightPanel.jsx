import React, { useState } from 'react';
import Stats from './Stats';
import Config from './Config';
import WordFrequency from './WordFrequency';
import HelpPopup from './HelpPopup';
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
  autoRotate,
  onAutoRotateChange,
  onAddCustomWord,
  isCollapsed,
  onCollapsedChange,
  marbleSelectTimeout,
  onMarbleSelectTimeoutChange
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className={`right-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-button"
        onClick={() => onCollapsedChange(!isCollapsed)}
        aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        {isCollapsed ? '>' : '<'}
      </button>
      <div className="panel-content">
        <div className="panel-section">
          <div className="section-header">
            <h3>Statistics</h3>
            <button 
              className="help-button"
              onClick={() => setIsHelpOpen(true)}
              aria-label="Help"
            >
              ?
            </button>
          </div>
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
            autoRotate={autoRotate}
            onAutoRotateChange={onAutoRotateChange}
            marbleSelectTimeout={marbleSelectTimeout}
            onMarbleSelectTimeoutChange={onMarbleSelectTimeoutChange}
          />
        </div>
      </div>
      <HelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default RightPanel;
