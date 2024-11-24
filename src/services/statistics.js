class Statistics {
  constructor(timeout = 60000) {
    this.timeout = timeout;
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
  }

  setTimeout(milliseconds) {
    this.timeout = milliseconds;
  }

  recordMessage(timestamp, byteSize, isFiltered) {
    // Always record in all stats
    this.messageStats.all.messages.push(timestamp);
    this.messageStats.all.bytes.push({ timestamp, size: byteSize });

    // Record in filtered stats if message passes filter
    if (isFiltered) {
      this.messageStats.filtered.messages.push(timestamp);
      this.messageStats.filtered.bytes.push({ timestamp, size: byteSize });
    }
  }

  clearFiltered() {
    this.messageStats.filtered = {
      messages: [],
      bytes: [],
    };
  }

  calculateStats(now, useFiltered, wordFrequencies) {
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

    // Use filtered stats if requested, otherwise use all stats
    const stats = useFiltered ? this.messageStats.filtered : this.messageStats.all;

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
      wordFrequencies,
    };
  }
}

export default Statistics;
