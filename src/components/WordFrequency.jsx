import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import './WordFrequency.css';

function WordFrequency({ wordFrequencies, selectedWords, onWordSelect, onWordHide, hiddenWords, onAddCustomWord }) {
  const [newWord, setNewWord] = useState('');
  const [colorPickerWord, setColorPickerWord] = useState(null);

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
    // Check if click was on the color strip (left border)
    const rect = e.currentTarget.getBoundingClientRect();
    const isColorStripClick = e.clientX - rect.left <= 20;

    if (isColorStripClick && selectedWords.has(word)) {
      e.stopPropagation();
      setColorPickerWord(word);
    } else if (!e.target.closest('.delete-button') && !e.target.closest('.color-picker-container')) {
      onWordSelect(word);
      setColorPickerWord(null);
    }
  };

  const handleColorChange = (color, word) => {
    onWordSelect(word, color.hex);
  };

  const handleDeleteClick = (e, word) => {
    e.stopPropagation();
    onWordHide(word);
    setColorPickerWord(null);
  };

  const handleAddWord = (e) => {
    if (e.key === 'Enter' && newWord.trim()) {
      const word = newWord.trim().toLowerCase();
      if (!hiddenWords.has(word)) {
        if (wordFrequencies.has(word)) {
          // If word exists, just select it
          onWordSelect(word);
        } else {
          // If it's a new word, add it as custom word
          onAddCustomWord(word);
        }
      }
      setNewWord('');
    }
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.color-picker-container') && !e.target.closest('.color-strip')) {
      setColorPickerWord(null);
    }
  };

  return (
    <div className="panel-section" onClick={handleClickOutside}>
      <h3>Word Frequency</h3>
      <div className="word-input-container">
        <input
          type="text"
          className="word-input"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={handleAddWord}
          placeholder="Add new word..."
        />
      </div>
      <div className="word-list">
        {topWords.map(([word, count]) => {
          const color = selectedWords.get(word);
          return (
            <div 
              key={word} 
              className={`word-item ${selectedWords.has(word) ? 'selected' : ''}`}
              onClick={(e) => handleWordClick(e, word)}
              style={{
                borderLeft: selectedWords.has(word)
                  ? `4px solid ${selectedWords.get(word)}`
                  : undefined,
                cursor: 'pointer',
                position: 'relative'
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
              {colorPickerWord === word && (
                <div className="color-picker-container">
                  <ChromePicker
                    color={selectedWords.get(word)}
                    onChange={(color) => handleColorChange(color, word)}
                    disableAlpha={true}
                  />
                </div>
              )}
            </div>
          );
        })}
        {topWords.length === 0 && (
          <div className="no-words">No words tracked yet</div>
        )}
      </div>
    </div>
  );
}

export default WordFrequency;
