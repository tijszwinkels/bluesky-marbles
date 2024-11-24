class WordAnalyzer {
  constructor() {
    this.wordOccurrences = new Map(); // Map<word, timestamp[]>
    this.wordsToSkip = new Set([
      'about', 'after', 'again', 'could', 'every', 'first', 'found', 'great',
      'large', 'never', 'other', 'place', 'point', 'right',
      'small', 'sound', 'still', 'their', 'there', 'these', 'thing',
      'think', 'three', 'water', 'where', 'which', 'world', 'would',
      'people', 'should', 'because', 'between', 'choose', 'always', 'literally',
      'through', 'basically', 'really', 'being', 'those', 'going', 'might',
      'during', 'another', 'while', 'getting', 'makes', 'seemed', 'since',
      'looks', 'doing', 'gonna', 'looking', 'though', 
    ]);
    this.wordsToAllow = new Set([
      'love', 'hate', 'sad', 'bad', 'cool', 'fuck', 'shit', 'damn',
      'good', 'kind', 'man'
    ]); // allowed words < 5 chars
  }

  updateWordFrequencies(text, now) {
    // Split on whitespace and process each word
    const words = new Set(
      text.toLowerCase()
        .split(/\s+/)
        .filter(word => 
          (word.length > 4 || this.wordsToAllow.has(word)) && 
          word.split('').every(char => char == "#" || char >= 'a' && char <= 'z') &&
          !this.wordsToSkip.has(word)
        )
    );
    
    words.forEach(word => {
      const timestamps = this.wordOccurrences.get(word) || [];
      timestamps.push(now);
      this.wordOccurrences.set(word, timestamps);
    });
  }

  getWordFrequencies(now, timeout) {
    const cutoff = now - timeout;
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

  clear() {
    this.wordOccurrences.clear();
  }
}

export default WordAnalyzer;
