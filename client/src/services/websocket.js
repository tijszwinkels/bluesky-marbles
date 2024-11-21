class WebSocketService {
  constructor(url, onMessage) {
    this.url = url;
    this.onMessage = onMessage;
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
    this.filterTerm = '';
  }

  setFilter(term) {
    this.filterTerm = term.toLowerCase();
    // Reset filtered stats when filter changes
    this.messageStats.filtered = {
      messages: [],
      bytes: [],
    };
  }

  shouldIncludeMessage(data) {
    if (!this.filterTerm) return true;
    const text = data.commit?.record?.text;
    return text && text.toLowerCase().includes(this.filterTerm);
  }

  calculateStats(now) {
    const oneMinuteAgo = now - 60000;
    
    // Clean up old stats (older than 1 minute)
    this.messageStats.all.messages = this.messageStats.all.messages.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );
    this.messageStats.all.bytes = this.messageStats.all.bytes.filter(
      (item) => item.timestamp > oneMinuteAgo
    );
    this.messageStats.filtered.messages = this.messageStats.filtered.messages.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );
    this.messageStats.filtered.bytes = this.messageStats.filtered.bytes.filter(
      (item) => item.timestamp > oneMinuteAgo
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
      }

      // Calculate stats based on current filter state
      const stats = this.calculateStats(now);

      // Call the onMessage callback with the data and stats
      // Only pass the message if it passes the filter
      if (this.shouldIncludeMessage(data)) {
        this.onMessage(data, stats);
      } else if (!this.filterTerm) {
        // If no filter, pass all messages
        this.onMessage(data, stats);
      } else {
        // If filtered out, just update stats
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
