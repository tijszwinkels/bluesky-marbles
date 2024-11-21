class WebSocketService {
  constructor(url, onMessage, timeout = 60) {
    this.url = url;
    this.onMessage = onMessage;
    this.timeout = timeout * 1000; // Convert seconds to milliseconds
    this.ws = null;
    this.messageStats = {
      all: {
        messages: [],
        bytes: [],
      },
      filtered: {
        messages: [],
        bytes: [],
      }
    };
    this.wordOccurrences = new Map(); // Map<word, timestamp[]>
    this.filterTerm = '';
  }

  setTimeout(seconds) {
    this.timeout = seconds * 1000;
  }

  setFilter(term) {
    this.filterTerm = term.toLowerCase();
    // Reset filtered stats and word frequencies when filter changes
    this.messageStats.filtered = {
      messages: [],
      bytes: [],
    };
    this.wordOccurrences.clear();
  }

  shouldIncludeMessage(data) {
    if (!this.filterTerm) return true;
    const text = data.commit?.record?.text;
    return text && text.toLowerCase().includes(this.filterTerm);
  }

  updateWordFrequencies(text, now) {
    // Split on whitespace and process each word
    const words = new Set(
      text.toLowerCase()
        .split(/\s+/)
        .filter(word => 
          word.length > 4 && 
          word.split('').every(char => char >= 'a' && char <= 'z')
        )
    );
    
    words.forEach(word => {
      const timestamps = this.wordOccurrences.get(word) || [];
      timestamps.push(now);
      this.wordOccurrences.set(word, timestamps);
    });
  }

  getWordFrequencies(now) {
    const cutoff = now - this.timeout;
    const frequencies = new Map();

    for (const [word, timestamps] of this.wordOccurrences.entries()) {
      // Filter out expired timestamps and update the array
      const validTimestamps = timestamps.filter(ts => ts > cutoff);
      
      if (validTimestamps.length > 0) {
        // Update the timestamps array with only valid ones
        this.wordOccurrences.set(word, validTimestamps);
        frequencies.set(word, validTimestamps.length);
      } else {
        // Remove words with no valid timestamps
        this.wordOccurrences.delete(word);
      }
    }

    return frequencies;
  }

  calculateStats(now) {
    const cutoff = now - this.timeout;
    
    // Clean up old stats
    this.messageStats.all.messages = this.messageStats.all.messages.filter(
      (timestamp) => timestamp > cutoff
    );
    this.messageStats.all.bytes = this.messageStats.all.bytes.filter(
      (item) => item.timestamp > cutoff
    );
    this.messageStats.filtered.messages = this.messageStats.filtered.messages.filter(
      (timestamp) => timestamp > cutoff
    );
    this.messageStats.filtered.bytes = this.messageStats.filtered.bytes.filter(
      (item) => item.timestamp > cutoff
    );

    // Use filtered stats if filter is active, otherwise use all stats
    const stats = this.filterTerm ? this.messageStats.filtered : this.messageStats.all;

    const messagesPerSecond = stats.messages.filter(
      (timestamp) => now - timestamp < 1000
    ).length;

    const bytesLastSecond = stats.bytes
      .filter((item) => now - item.timestamp < 1000)
      .reduce((sum, item) => sum + item.size, 0);

    const bytesLastMinute = stats.bytes
      .reduce((sum, item) => sum + item.size, 0);

    return {
      messagesPerSecond,
      messagesPerMinute: stats.messages.length,
      bytesPerSecond: bytesLastSecond,
      bytesPerMinute: bytesLastMinute,
      wordFrequencies: this.getWordFrequencies(now),
    };
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

      // Always record in all stats
      this.messageStats.all.messages.push(now);
      this.messageStats.all.bytes.push({ timestamp: now, size: byteSize });

      // Check if message passes filter
      if (this.shouldIncludeMessage(data)) {
        // Record in filtered stats
        this.messageStats.filtered.messages.push(now);
        this.messageStats.filtered.bytes.push({ timestamp: now, size: byteSize });

        // Only update word frequencies for filtered messages
        const text = data.commit?.record?.text;
        if (text) {
          this.updateWordFrequencies(text, now);
        }
      }

      // Calculate stats based on current filter state
      const stats = this.calculateStats(now);

      // Call the onMessage callback with the data and stats
      if (this.shouldIncludeMessage(data)) {
        this.onMessage(data, stats);
      } else if (!this.filterTerm) {
        this.onMessage(data, stats);
      } else {
        this.onMessage(null, stats);
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
