import React, { useState, useEffect, useRef } from 'react';
import WebSocketService from './services/websocket';
import Filter from './components/Filter';
import LastTweet from './components/LastTweet';
import MarblesDisplay from './components/MarblesDisplay';
import RightPanel from './components/RightPanel';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
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
  const [fadeEnabled, setFadeEnabled] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('fade') !== 'false';
  });
  const [stats, setStats] = useState({
    messagesPerSecond: 0,
    messagesPerMinute: 0,
    bytesPerSecond: 0,
    bytesPerMinute: 0,
  });

  const wsRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket service
    const wsService = new WebSocketService(
      'wss://jetstream2.us-west.bsky.network/subscribe?wantedCollections=app.bsky.feed.post',
      handleMessage
    );

    // Store reference
    wsRef.current = wsService;

    // Connect to WebSocket
    wsService.connect();

    // Set initial filter if present in URL
    if (filterTerm) {
      wsService.setFilter(filterTerm);
    }

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

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

  const handleMessage = (data, newStats) => {
    // Update stats regardless of whether we received a message
    setStats(newStats);

    // Only add message if we received one (filtered messages won't be passed)
    if (data) {
      setMessages((prevMessages) => [...prevMessages, data]);
    }
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

  const handleFadeChange = (enabled) => {
    setFadeEnabled(enabled);
    updateURL({ fade: enabled ? null : 'false' }); // Only add to URL when disabled
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
        fadeEnabled={fadeEnabled}
        onFadeChange={handleFadeChange}
      />
    </div>
  );
}

export default App;
