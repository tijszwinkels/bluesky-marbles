import React from 'react';

function DotsDisplay({ messages }) {
  return (
    <div className="dots-container">
      {messages.map((msg, index) => (
        <span key={index} className="dot" title={msg.commit?.record?.text || 'No text'}>
          •
        </span>
      ))}
    </div>
  );
}

export default DotsDisplay;
