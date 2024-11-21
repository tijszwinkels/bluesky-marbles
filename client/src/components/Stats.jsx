import React from 'react';
import { formatBytes } from '../utils/formatters';
import './Stats.css';

function Stats({ stats }) {
  return (
    <div className="stats-container">
      <div className="stat-item">
        <div className="stat-value">{stats?.messagesPerSecond || 0}</div>
        <div className="stat-label">Messages/sec</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats?.messagesPerMinute || 0}</div>
        <div className="stat-label">Messages/min</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{formatBytes(stats?.bytesPerSecond || 0)}/s</div>
        <div className="stat-label">Throughput</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{formatBytes(stats?.bytesPerMinute || 0)}/m</div>
        <div className="stat-label">Volume/min</div>
      </div>
    </div>
  );
}

export default Stats;
