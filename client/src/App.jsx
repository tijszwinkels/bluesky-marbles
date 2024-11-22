import React, { useState, useEffect, useRef, useCallback } from 'react';
import WebSocketService from './services/websocket';
import Filter from './components/Filter';
import LastTweet from './components/LastTweet';
import MarblesDisplay from './components/MarblesDisplay';
import RightPanel from './components/RightPanel';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [selectedWords, setSelectedWords] = useState(new Map()); // Map of word -> color
  const [hiddenWords, setHiddenWords] = useState(new Set()); // Set of hidden words
  const [filterTerm, setFilterTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('filter') || '';
  });
  const [timeout, setTimeout] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('timeout')) || 60;
  });
  const [marbleSize, setMarbleSize] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseFloat(params.get('size')) || 0.2;
  });
  const [fraction, setFraction] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseFloat(params.get('fraction')) || 1.0;
  });
  const [fadeEnabled, setFadeEnabled] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('fade') !== 'false';
  });
  const [onlySelectedWords, setOnlySelectedWords] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('onlySelected') === 'true';
  });
  const [stats, setStats] = useState({
    messagesPerSecond: 0,
    messagesPerMinute: 0,
    bytesPerSecond: 0,
    bytesPerMinute: 0,
  });

  const wsRef = useRef(null);

  // Generate a random color
  const generateColor = () => {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleWordSelect = (word) => {
    setSelectedWords(prev => {
      const next = new Map(prev);
      if (next.has(word)) {
        next.delete(word);
      } else {
        next.set(word, generateColor());
      }
      return next;
    });
  };

  const handleWordHide = (word) => {
    setHiddenWords(prev => {
      const next = new Set(prev);
      next.add(word);
      return next;
    });
    // Also remove from selected if it was selected
    setSelectedWords(prev => {
      const next = new Map(prev);
      next.delete(word);
      return next;
    });
  };

  const handleMessage = useCallback((data, newStats) => {
    // Update stats regardless of whether we received a message
    setStats(newStats);

    // Only add message if we received one (filtered messages won't be passed)
    if (data) {
      const messageText = data?.commit?.record?.text;
      
      // If onlySelectedWords is enabled and we have selected words,
      // only show messages that contain at least one selected word
      if (onlySelectedWords && selectedWords.size > 0) {
        // Skip if there's no message text
        if (!messageText) {
          return;
        }

        const selectedWordsList = Array.from(selectedWords.keys());
        const messageLower = messageText.toLowerCase();
        
        const hasSelectedWord = selectedWordsList.some(word => 
          messageLower.includes(word.toLowerCase())
        );
        
        if (!hasSelectedWord) {
          return; // Skip this message
        }
      }

      setMessages(prevMessages => [...prevMessages, data]);
    }
  }, [onlySelectedWords, selectedWords]);

  // Initialize WebSocket service once
  useEffect(() => {
    const wsService = new WebSocketService(
      'wss://jetstream2.us-west.bsky.network/subscribe?wantedCollections=app.bsky.feed.post',
      handleMessage,
      timeout,
      fraction
    );

    wsRef.current = wsService;
    wsService.connect();

    if (filterTerm) {
      wsService.setFilter(filterTerm);
    }

    return () => {
      wsService.disconnect();
    };
  }, []); // Empty dependency array - only initialize once

  // Update the message handler when it changes
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onMessage = handleMessage;
    }
  }, [handleMessage]);

  // Update timeout in WebSocket service when it changes
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.setTimeout(timeout);
    }
  }, [timeout]);

  // Update fraction in WebSocket service when it changes
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.setFraction(fraction);
    }
  }, [fraction]);

  const updateURL = (updates) => {
    const url = new URL(window.location);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.history.pushState({}, '', url);
  };

  const handleFilterChange = (newFilterTerm) => {
    setFilterTerm(newFilterTerm);
    // Update filter in WebSocket service
    if (wsRef.current) {
      wsRef.current.setFilter(newFilterTerm);
    }
    // Reset messages when filter changes
    setMessages([]);
    // Update URL
    updateURL({ filter: newFilterTerm });
  };

  const handleTimeoutChange = (newTimeout) => {
    setTimeout(newTimeout);
    updateURL({ timeout: newTimeout });
  };

  const handleMarbleSizeChange = (newSize) => {
    setMarbleSize(newSize);
    updateURL({ size: newSize });
  };

  const handleFractionChange = (newFraction) => {
    setFraction(newFraction);
    updateURL({ fraction: newFraction });
  };

  const handleFadeChange = (enabled) => {
    setFadeEnabled(enabled);
    updateURL({ fade: enabled ? null : 'false' }); // Only add to URL when disabled
  };

  const handleOnlySelectedWordsChange = (enabled) => {
    setOnlySelectedWords(enabled);
    updateURL({ onlySelected: enabled ? 'true' : null }); // Only add to URL when enabled
    // Clear existing messages when toggling this option
    setMessages([]);
  };

  return (
    <div className="container">
      <div className="main-content">
        <div className="filter-container">
          <Filter value={filterTerm} onChange={handleFilterChange} />
        </div>
        <div className="last-tweet">
          <LastTweet messages={messages} />
        </div>
        <div className="visualization-row">
          <div className="marbles-container">
            <MarblesDisplay 
              messages={messages} 
              timeout={timeout} 
              marbleSize={marbleSize}
              fadeEnabled={fadeEnabled}
              selectedWords={selectedWords}
            />
          </div>
        </div>
      </div>
      <RightPanel 
        stats={stats}
        timeout={timeout}
        onTimeoutChange={handleTimeoutChange}
        marbleSize={marbleSize}
        onMarbleSizeChange={handleMarbleSizeChange}
        fraction={fraction}
        onFractionChange={handleFractionChange}
        fadeEnabled={fadeEnabled}
        onFadeChange={handleFadeChange}
        onlySelectedWords={onlySelectedWords}
        onOnlySelectedWordsChange={handleOnlySelectedWordsChange}
        selectedWords={selectedWords}
        onWordSelect={handleWordSelect}
        onWordHide={handleWordHide}
        hiddenWords={hiddenWords}
      />
    </div>
  );
}

export default App;
