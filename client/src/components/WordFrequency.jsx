import React from 'react';
import './WordFrequency.css';

function WordFrequency({ wordFrequencies, selectedWords, onWordSelect, onWordHide, hiddenWords }) {
  const filteredWords = [...wordFrequencies.entries()]
    .filter(([word]) => !hiddenWords.has(word));

  // Separate selected and non-selected words
  const selectedEntries = filteredWords.filter(([word]) => selectedWords.has(word));
  const nonSelectedEntries = filteredWords.filter(([word]) => !selectedWords.has(word));

  // Sort both groups by frequency
  const sortByFrequency = (a, b) => b[1] - a[1];
  const sortedSelected = selectedEntries.sort(sortByFrequency);
  const sortedNonSelected = nonSelectedEntries.sort(sortByFrequency);

  // Combine the sorted groups with selected words at the top, now showing up to 100 words
  const topWords = [...sortedSelected, ...sortedNonSelected].slice(0, 100);

  const handleWordClick = (e, word) => {
    // Only handle clicks on the word item, not the delete button
    if (!e.target.closest('.delete-button')) {
      onWordSelect(word);
    }
  };

  const handleDeleteClick = (e, word) => {
    e.stopPropagation();
    onWordHide(word);
  };

  return (
    <div className="panel-section">
      <h3>Word Frequency</h3>
      <div className="word-list">
        {topWords.map(([word, count]) => (
          <div 
            key={word} 
            className={`word-item ${selectedWords.has(word) ? 'selected' : ''}`}
            onClick={(e) => handleWordClick(e, word)}
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
              onClick={(e) => handleDeleteClick(e, word)}
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
