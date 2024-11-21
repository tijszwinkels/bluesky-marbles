import React, { useState } from 'react';
import './WordFrequency.css';

function WordFrequency({ wordFrequencies }) {
  const [hiddenWords, setHiddenWords] = useState(new Set());

  const handleHideWord = (word) => {
    setHiddenWords(prev => {
      const newSet = new Set(prev);
      newSet.add(word);
      return newSet;
    });
  };

  const topWords = [...wordFrequencies.entries()]
    .filter(([word]) => !hiddenWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="panel-section">
      <h3>Word Frequency</h3>
      <div className="word-list">
        {topWords.map(([word, count]) => (
          <div key={word} className="word-item">
            <div className="word-info">
              <span className="word">{word}</span>
              <span className="count">{count}</span>
            </div>
            <button 
              className="delete-button" 
              onClick={() => handleHideWord(word)}
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
