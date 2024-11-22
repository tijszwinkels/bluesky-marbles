import React from 'react';
import './WordFrequency.css';

function WordFrequency({ wordFrequencies, selectedWords, onWordSelect }) {
  const topWords = [...wordFrequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const handleWordClick = (word, e) => {
    // Prevent click from triggering if delete button was clicked
    if (e.target.className !== 'delete-button') {
      onWordSelect(word);
    }
  };

  return (
    <div className="panel-section">
      <h3>Word Frequency</h3>
      <div className="word-list">
        {topWords.map(([word, count]) => (
          <div 
            key={word} 
            className={`word-item ${selectedWords.has(word) ? 'selected' : ''}`}
            onClick={(e) => handleWordClick(word, e)}
            style={{
              backgroundColor: selectedWords.has(word) 
                ? `${selectedWords.get(word)}15` // Add transparency to background
                : undefined,
              borderLeft: selectedWords.has(word)
                ? `4px solid ${selectedWords.get(word)}`
                : undefined,
              cursor: 'pointer'
            }}
          >
            <div className="word-info">
              <span 
                className="word"
                style={{
                  color: selectedWords.has(word) 
                    ? selectedWords.get(word) 
                    : undefined
                }}
              >
                {word}
              </span>
              <span className="count">{count}</span>
            </div>
            <button 
              className="delete-button" 
              onClick={() => onWordSelect(word)}
              aria-label={`Hide ${word}`}
            />
          </div>
        ))}
        {topWords.length === 0 && (
          <div className="no-words">No words tracked yet</div>
        )}
      </div>
    </div>
  );
}

export default WordFrequency;
