import React from 'react';
import './Filter.css';

function Filter({ value, onChange }) {
  return (
    <div className="filter-container">
      <input
        type="text"
        placeholder="Enter filter term"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="filter-input"
      />
    </div>
  );
}

export default Filter;
