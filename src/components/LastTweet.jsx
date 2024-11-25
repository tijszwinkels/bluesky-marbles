import React from 'react';
import './LastTweet.css';

const LastTweet = ({ messages, marbleSelectTimeout }) => {
  if (!messages || !messages[0]) {
    return (
      <div className="last-tweet">
        <div>No tweet selected</div>
      </div>
    );
  }

  const lastMessage = messages[0];
  const text = lastMessage.commit?.record?.text;
  const author = lastMessage.did;
  const postId = lastMessage.commit?.rkey;

  if (!text || !author || !postId) {
    return (
      <div className="last-tweet">
        <div>Invalid or empty tweet</div>
      </div>
    );
  }

  const blueskyUrl = `https://bsky.app/profile/${author}/post/${postId}`;

  return (
    <div className="last-tweet">
      <div 
        className="progress-bar" 
        style={{ '--animation-duration': `${marbleSelectTimeout}s` }}
        key={postId}
      ></div>
      <a href={blueskyUrl} target="_blank" rel="noopener noreferrer">
        <strong>{author}</strong>: {text}
      </a>
    </div>
  );
};

export default LastTweet;
