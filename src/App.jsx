import React, { useState, useEffect, useRef, useCallback } from 'react';
import WebSocketService from './services/websocket';
import Filter from './components/Filter';
import LastTweet from './components/LastTweet';
import MarblesDisplay from './components/MarblesDisplay';
import RightPanel from './components/RightPanel';
import './App.css';

function App() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(window.innerWidth <= 768);
  const [selectedWords, setSelectedWords] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const wordsParam = params.get('words');
    if (wordsParam) {
      return new Map(
        wordsParam.split(',').map(pair => {
          const [word, color] = pair.split(':');
          return [decodeURIComponent(word), `#${color}`];
        })
      );
    }
    return new Map();
  });
  const [hiddenWords, setHiddenWords] = useState(new Set());
  const [customWords, setCustomWords] = useState(new Map());
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
    return parseFloat(params.get('size')) || 0.5;
  });
  const [fraction, setFraction] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseFloat(params.get('fraction')) || 0.01;
  });
  const [fadeEnabled, setFadeEnabled] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('fade') !== 'false';
  });
  const [autoRotate, setAutoRotate] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('rotate') !== 'false';
  });
  const [onlySelectedWords, setOnlySelectedWords] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('onlySelected') === 'true';
  });
  const [marbleSelectTimeout, setMarbleSelectTimeout] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('selectTimeout')) || 7;
  });
  const [stats, setStats] = useState({
    messagesPerSecond: 0,
    messagesPerMinute: 0,
    bytesPerSecond: 0,
    bytesPerMinute: 0,
    wordFrequencies: new Map()
  });

  const wsRef = useRef(null);

  const handleMessage = useCallback((data, newStats) => {
    if (newStats !== null) {
      setStats(prev => {
        const mergedFrequencies = new Map(newStats.wordFrequencies || new Map());
        customWords.forEach((freq, word) => {
          if (!mergedFrequencies.has(word)) {
            mergedFrequencies.set(word, freq);
          }
        });
        return { ...newStats, wordFrequencies: mergedFrequencies };
      });
    }

    if (data) {
      const messageText = data?.commit?.record?.text;
      
      if (onlySelectedWords && selectedWords.size > 0) {
        if (!messageText) {
          return;
        }

        const selectedWordsList = Array.from(selectedWords.keys());
        const messageLower = messageText.toLowerCase();
        
        const hasSelectedWord = selectedWordsList.some(word => 
          messageLower.includes(word.toLowerCase())
        );
        
        if (!hasSelectedWord) {
          return;
        }
      }

      setMessages(prevMessages => [...prevMessages, data]);
    }
  }, [onlySelectedWords, selectedWords, customWords]);

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
  }, []);

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onMessage = handleMessage;
    }
  }, [handleMessage]);

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.setTimeout(timeout);
    }
  }, [timeout]);

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

  useEffect(() => {
    if (selectedWords.size > 0) {
      const wordsString = Array.from(selectedWords.entries())
        .map(([word, color]) => {
          const cleanColor = color.replace('#', '');
          return `${encodeURIComponent(word)}:${cleanColor}`;
        })
        .join(',');
      updateURL({ words: wordsString });
    } else {
      updateURL({ words: null });
    }
  }, [selectedWords]);

  const handleWordSelect = (word, newColor) => {
    setSelectedWords(prev => {
      const next = new Map(prev);
      if (next.has(word) && !newColor) {
        next.delete(word);
      } else if (newColor) {
        next.set(word, newColor);
      } else {
        next.set(word, `#${Math.floor(Math.random()*16777215).toString(16)}`);
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
    setSelectedWords(prev => {
      const next = new Map(prev);
      next.delete(word);
      return next;
    });
    setCustomWords(prev => {
      const next = new Map(prev);
      next.delete(word);
      return next;
    });
  };

  const handleAddCustomWord = (word) => {
    setCustomWords(prev => {
      const next = new Map(prev);
      if (!next.has(word)) {
        next.set(word, 0);
        handleWordSelect(word);
      }
      return next;
    });
  };

  const handleFilterChange = (newFilterTerm) => {
    setFilterTerm(newFilterTerm);
    if (wsRef.current) {
      wsRef.current.setFilter(newFilterTerm);
    }
    setMessages([]);
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
    updateURL({ fade: enabled ? null : 'false' });
  };

  const handleAutoRotateChange = (enabled) => {
    setAutoRotate(enabled);
    updateURL({ rotate: enabled ? null : 'false' });
  };

  const handleOnlySelectedWordsChange = (enabled) => {
    setOnlySelectedWords(enabled);
    updateURL({ onlySelected: enabled ? 'true' : null });
    setMessages([]);
  };

  const handleMarbleSelectTimeoutChange = (newTimeout) => {
    setMarbleSelectTimeout(newTimeout);
    updateURL({ selectTimeout: newTimeout });
  };

  return (
    <div className={`container ${isRightPanelCollapsed ? 'panel-collapsed' : ''}`}>
      <div className="main-content">
        <div className="filter-container">
          <Filter value={filterTerm} onChange={handleFilterChange} />
        </div>
          <LastTweet messages={[selectedMessage]} marbleSelectTimeout={marbleSelectTimeout} />
        <div className="visualization-row">
          <div className="marbles-container">
            <MarblesDisplay 
              messages={messages} 
              timeout={timeout} 
              marbleSize={marbleSize}
              fadeEnabled={fadeEnabled}
              selectedWords={selectedWords}
              autoRotate={autoRotate}
              onMarbleSelect={setSelectedMessage}
              marbleSelectTimeout={marbleSelectTimeout}
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
        autoRotate={autoRotate}
        onAutoRotateChange={handleAutoRotateChange}
        onlySelectedWords={onlySelectedWords}
        onOnlySelectedWordsChange={handleOnlySelectedWordsChange}
        selectedWords={selectedWords}
        onWordSelect={handleWordSelect}
        onWordHide={handleWordHide}
        hiddenWords={hiddenWords}
        onAddCustomWord={handleAddCustomWord}
        isCollapsed={isRightPanelCollapsed}
        onCollapsedChange={setIsRightPanelCollapsed}
        marbleSelectTimeout={marbleSelectTimeout}
        onMarbleSelectTimeoutChange={handleMarbleSelectTimeoutChange}
      />
    </div>
  );
}

export default App;
