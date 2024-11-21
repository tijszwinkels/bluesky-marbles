import React, { useState, useEffect, useRef } from 'react';
import WebSocketService from './services/websocket';
import Stats from './components/Stats';
import Filter from './components/Filter';
import LastTweet from './components/LastTweet';
import MarblesDisplay from './components/MarblesDisplay';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [filterTerm, setFilterTerm] = useState('');
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

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

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
  };

  return (
    <div className="container">
      <h1>BlueSky Jetstream Visualization</h1>
      <div className="filter-container">
        <Filter value={filterTerm} onChange={handleFilterChange} />
      </div>
      <div className="stats-container">
        <Stats stats={stats} />
      </div>
      <div className="last-tweet">
        <LastTweet messages={messages} />
      </div>
      <div className="marbles-container">
        <MarblesDisplay messages={messages} />
      </div>
    </div>
  );
}

export default App;
