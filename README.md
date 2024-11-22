# BlueSky Marbles
 
A real-time 3D visualization of BlueSky's jetstream (firehose) feed, where each post materializes as a marble in a physics-enabled environment. The visualization provides an engaging way to observe and analyze the flow of posts on the BlueSky social network.

## Features

- **Real-time Visualization**: Each BlueSky post appears as a marble dropping into a transparent container
- **Physics-based Animation**: Uses Three.js and React Three Fiber for realistic marble physics and interactions
- **Word Tracking**: 
  - Track and visualize frequency of words in posts
  - Color-code marbles based on contained words
  - Custom word tracking with color assignments
  - Automatic filtering of common words
- **Interactive Controls**:
  - Filter posts by specific terms
  - Adjust marble size and lifetime
  - Toggle fade effects
  - Control message sampling rate
  - Orbit camera controls for 3D view manipulation
- **Performance Statistics**:
  - Messages per second
  - Messages per minute
  - Throughput monitoring (KB/s, MB/min)
  - Word frequency analysis
- **URL State Management**: All settings are preserved in the URL for easy sharing and restoration

## Technical Stack

- React + Vite for the frontend framework
- Three.js + React Three Fiber for 3D graphics
- React Three Cannon for physics simulation
- WebSocket connection to BlueSky's jetstream

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal)

## Usage

### Basic Controls

- **Filter Box**: Enter terms to filter incoming posts
- **3D Controls**: Click and drag to rotate the view, scroll to zoom
- **Right Panel**: Access statistics and configuration options

### Configuration Options

- **Marble Timeout**: Control how long marbles remain visible (in seconds)
- **Marble Size**: Adjust the size of the marbles
- **Message Fraction**: Control what fraction of messages to display (0.0 - 1.0)
- **Fade Effect**: Toggle marble fade-out effect
- **Word Selection**: Track and color-code specific words

### Word Tracking

1. Words appearing in posts are automatically tracked and displayed in the frequency panel
2. Click on a word to assign it a color - marbles containing that word will use that color
3. Add custom words to track using the input field
4. Hide irrelevant words by clicking the hide button

### URL Parameters

All settings can be controlled via URL parameters:
- `filter`: Text to filter posts
- `timeout`: Marble lifetime in seconds
- `size`: Marble size (0.0 - 1.0)
- `fraction`: Message sampling rate (0.0 - 1.0)
- `fade`: Enable/disable fade effect
- `words`: Comma-separated list of word:color pairs
- `onlySelected`: Show only posts containing selected words

Example:
```
http://localhost:5173/?filter=tech&timeout=30&size=0.3&words=love:ff0000,hate:0000ff
```

## Contributing

Feel free to open issues or submit pull requests with improvements. Some areas that could be enhanced:
- Additional visualization modes
- More post analysis features
- Performance optimizations
- UI/UX improvements

## License

MIT License - feel free to use and modify as needed.
