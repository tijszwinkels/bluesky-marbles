import React from 'react';

function Filter({ value, onChange }) {
  return (
    <div className="controls">
      <label>Global filter:</label> <input
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
