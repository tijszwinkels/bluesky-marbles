class MessageFilter {
  constructor(fraction = 0.01) {
    this.filterTerm = '';
    this.fraction = fraction;
  }

  setFraction(fraction) {
    this.fraction = fraction;
  }

  setFilter(term) {
    this.filterTerm = term.toLowerCase();
  }

  shouldIncludeMessage(data) {
    // First check if we should randomly drop this message
    if (Math.random() > this.fraction) {
      return false;
    }
    
    // Then check if it matches the filter
    if (!this.filterTerm) return true;
    const text = data.commit?.record?.text;
    return text && text.toLowerCase().includes(this.filterTerm);
  }
}

export default MessageFilter;
