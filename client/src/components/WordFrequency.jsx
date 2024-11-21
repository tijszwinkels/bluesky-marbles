import React from 'react';
import './WordFrequency.css';

function WordFrequency({ wordFrequencies }) {
  const topWords = [...wordFrequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="panel-section">
      <h3>Word Frequency</h3>
      <div className="word-list">
        {topWords.map(([word, count]) => (
          <div key={word} className="word-item">
            <span className="word">{word}</span>
            <span className="count">{count}</span>
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
