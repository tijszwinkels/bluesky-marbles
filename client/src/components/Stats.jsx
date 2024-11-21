import React from 'react';
import { formatBytes } from '../utils/formatters';

function Stats({ stats }) {
  return (
    <div className="stats">
      <div className="stat-item">
        <label>Messages/sec:</label>
        <span>{stats.messagesPerSecond}</span>
      </div>
      <div className="stat-item">
        <label>Messages/min:</label>
        <span>{stats.messagesPerMinute}</span>
      </div>
      <div className="stat-item">
        <label>Bytes/sec:</label>
        <span>{formatBytes(stats.bytesPerSecond)}/s</span>
      </div>
      <div className="stat-item">
        <label>Bytes/min:</label>
        <span>{formatBytes(stats.bytesPerMinute)}/m</span>
      </div>
    </div>
  );
}

export default Stats;
