import React from 'react';
import './LastTweet.css';

const LastTweet = ({ messages, marbleSelectTimeout }) => {
  if (messages.length === 0) return null;

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.kind !== 'commit' || !lastMessage.commit?.record?.text) return null;

  const text = lastMessage.commit.record.text;
  const author = lastMessage.did;
  const postId = lastMessage.commit.rkey;

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
