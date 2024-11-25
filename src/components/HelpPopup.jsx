import React from 'react';
import './HelpPopup.css';

function HelpPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="help-overlay">
      <div className="help-popup">
        <button className="help-close-button" onClick={onClose}>×</button>
        <div className="help-content">
          <p>
            This is animation of marbles falling in a glass vase. Each message on Bluesky fitting the filter criteria is a single marble. View the text in a marble by hovering the mouse over it.
          </p>
          <p>
            Starting the app, no words are selected and every message gets a different color. On the right pane, counts of the different words in the jetstream are tracked. You can put a global filter at the top. By default, it's only showing 1% of all messages. Change the 'message fraction' configuration to change that.
          </p>
          <p>
            Click one or multiple words to assign colors. Click on the color to change it. By default, all other marbles are still shown. Click the 'Only Selected Words' configuration to only show words with a color assigned. After doing this, you can likely increase the message fraction.
          </p>
          <p>
            If the message fraction is 1, all messages going through bluesky are processed.
          </p>
          <p>
            Happy with a visualization? The URL contains all settings! - Copy the url and share it on Bluesky mentioning #Marbles.
          </p>
          <h4>Examples</h4>
          <ul>
            <li>Basic visualization: <a href="https://tijszwinkels.github.io/bluesky-marbles/" target="_blank" rel="noopener noreferrer">Open here</a></li>
            <li>Love vs Hate visualization: <a href="https://tijszwinkels.github.io/bluesky-marbles/?fraction=1&size=0.5&words=hate%3A6cd926%2Clove%3A4f2aa4%2Chappy%3A0000ed%2Csad%3Ac4a4ce&onlySelected=true&timeout=91" target="_blank" rel="noopener noreferrer">View example</a> (Love and happiness still wins!)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HelpPopup;
