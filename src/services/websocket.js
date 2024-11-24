import MessageFilter from './messageFilter';
import Statistics from './statistics';
import WordAnalyzer from './wordAnalyzer';

class WebSocketService {
  constructor(url, onMessage, timeout = 60, fraction = 0.01) {
    this.url = url;
    this.onMessage = onMessage;
    this.ws = null;
    this.lastStatsUpdate = 0;
    this.debounceInterval = 100;

    // Initialize sub-services
    this.messageFilter = new MessageFilter(fraction);
    this.statistics = new Statistics(timeout * 1000);
    this.wordAnalyzer = new WordAnalyzer();
  }

  setTimeout(seconds) {
    this.statistics.setTimeout(seconds * 1000);
  }

  setFraction(fraction) {
    this.messageFilter.setFraction(fraction);
  }

  setFilter(term) {
    this.messageFilter.setFilter(term);
    this.statistics.clearFiltered();
    this.wordAnalyzer.clear();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to Jetstream');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const byteSize = new TextEncoder().encode(event.data).length;
      const now = Date.now();

      const isIncluded = this.messageFilter.shouldIncludeMessage(data);
      this.statistics.recordMessage(now, byteSize, isIncluded);

      // Update word frequencies for included messages
      if (isIncluded) {
        const text = data.commit?.record?.text;
        if (text) {
          this.wordAnalyzer.updateWordFrequencies(text, now);
        }
      }

      // Calculate stats based on current filter state
      const shouldUpdateStats = now - this.lastStatsUpdate >= this.debounceInterval;
      if (shouldUpdateStats) {
        const wordFrequencies = this.wordAnalyzer.getWordFrequencies(now, this.statistics.timeout);
        const stats = this.statistics.calculateStats(
          now, 
          Boolean(this.messageFilter.filterTerm),
          wordFrequencies
        );

        // Call onMessage with stats
        if (isIncluded) {
          this.onMessage(data, stats);
        } else if (!this.messageFilter.filterTerm && Math.random() <= this.messageFilter.fraction) {
          this.onMessage(data, stats);
        } else {
          this.onMessage(null, stats);
        }

        this.lastStatsUpdate = now;
      } else if (isIncluded) {
        // If we're not updating stats but the message is included, send it without stats
        this.onMessage(data, null);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from Jetstream');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default WebSocketService;
