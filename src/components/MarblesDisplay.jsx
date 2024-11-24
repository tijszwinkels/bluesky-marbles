import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, useSphere, usePlane, useBox } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';
import './MarblesDisplay.css';

// Helper function to blend colors
function blendColors(colors) {
  if (colors.length === 0) return '#808080'; // Default gray for no selected words
  if (colors.length === 1) return colors[0];

  // Convert colors to RGB
  const rgbColors = colors.map(color => {
    // Handle HSL colors
    if (color.startsWith('hsl')) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    }
    // Handle hex colors
    const hex = color.replace('#', '');
    return [
      parseInt(hex.substr(0, 2), 16),
      parseInt(hex.substr(2, 2), 16),
      parseInt(hex.substr(4, 2), 16)
    ];
  });

  // Average the RGB values
  const blended = rgbColors.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0]
  ).map(v => Math.round(v / colors.length));

  // Convert back to hex
  return `#${blended.map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Generate a random color
function generateRandomColor() {
  const hue = Math.random() * 360;
  return `hsl(${hue}, 70%, 50%)`;
}

function Marble({ position, color, opacity, size }) {
  const [ref] = useSphere(() => ({
    mass: 1,
    position,
    args: [size], // Radius of the sphere
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhysicalMaterial 
        color={color}
        transparent={true}
        opacity={opacity}
        roughness={0}
        metalness={0.1}
        transmission={0.3}
        thickness={0.5}
      />
    </mesh>
  );
}

function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
    </mesh>
  );
}

function Wall({ position, args }) {
  const [ref] = useBox(() => ({
    args,
    position,
    type: 'Static',
  }));

  return (
    <mesh ref={ref}>
      <boxGeometry args={args} />
      <meshPhysicalMaterial 
        color="#ffffff"
        transparent={true}
        opacity={0.2}
        roughness={0}
        metalness={0.1}
        transmission={0.9}
        side={2}
        depthWrite={false}
      />
    </mesh>
  );
}

function Vase() {
  const height = 11;
  const thickness = 0.2;
  const width = 8;
  const wallHeight = height;
  
  return (
    <group position={[0, height/2, 0]}>
      {/* All walls are now straight and unified */}
      <Wall 
        position={[0, 0, width/2]} 
        args={[width, wallHeight, thickness]}
      />
      <Wall 
        position={[0, 0, -width/2]} 
        args={[width, wallHeight, thickness]}
      />
      <Wall 
        position={[-width/2, 0, 0]} 
        args={[thickness, wallHeight, width]}
      />
      <Wall 
        position={[width/2, 0, 0]} 
        args={[thickness, wallHeight, width]}
      />
    </group>
  );
}

function MarblesDisplay({ messages, timeout = 60, marbleSize = 0.5, fadeEnabled = true, selectedWords }) {
  const [marbles, setMarbles] = useState([]);
  const marbleCountRef = useRef(0);

  useEffect(() => {
    if (messages.length === 0) return;

    // Add a new marble for the latest message
    const lastMessage = messages[messages.length - 1];
    const messageText = lastMessage?.commit?.record?.text;
    marbleCountRef.current += 1;

    // Find which selected words appear in the message
    const matchingWords = messageText 
      ? Array.from(selectedWords.keys())
          .filter(word => messageText.toLowerCase().includes(word.toLowerCase()))
      : [];
    
    // Determine marble color:
    // - If no words are selected, use random color
    // - If words are selected but none match, use white
    // - If words match, blend their colors
    let marbleColor;
    if (selectedWords.size === 0) {
      marbleColor = generateRandomColor();
    } else if (matchingWords.length === 0) {
      marbleColor = '#efefff';
    } else {
      marbleColor = blendColors(matchingWords.map(word => selectedWords.get(word)));
    }

    const newMarble = {
      id: `marble-${Date.now()}-${marbleCountRef.current}`,
      timestamp: Date.now(),
      position: [Math.random() * 5 - 2, 15, Math.random() * 5 - 2],
      color: marbleColor,
    };

    setMarbles((prevMarbles) => [...prevMarbles, newMarble]);

    // Remove marbles older than timeout
    const now = Date.now();
    setMarbles((prevMarbles) =>
      prevMarbles.filter((marble) => now - marble.timestamp < timeout * 1000)
    );
  }, [messages, timeout, selectedWords]);

  // Calculate opacity based on remaining time and fade setting
  const getOpacity = (timestamp) => {
    if (!fadeEnabled) return 1;
    const age = Date.now() - timestamp;
    const remainingTime = (timeout * 1000) - age;
    return Math.max(0.1, remainingTime / (timeout * 1000));
  };

  // Calculate camera position with 30° offset
  const angle = Math.PI / 6; // 30 degrees in radians
  const distance = 20;
  const cameraX = Math.sin(angle) * distance;
  const cameraZ = Math.cos(angle) * distance;

  return (
    <div className="marbles-container">
      <Canvas shadows camera={{ position: [cameraX, 14, cameraZ], fov: 45, target: [0, 4, 0] }}>
        <color attach="background" args={['#f5f5f5']} />
        <ambientLight intensity={0.8} />
        <spotLight
          position={[10, 10, 5]}
          angle={0.3}
          penumbra={1}
          castShadow
          intensity={1.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-10, 10, -5]}
          intensity={0.5}
        />
        <Physics gravity={[0, -9.81, 0]}>
          <Ground />
          <Vase />
          {marbles.map((marble) => (
            <Marble
              key={marble.id}
              position={marble.position}
              color={marble.color}
              opacity={getOpacity(marble.timestamp)}
              size={marbleSize}
            />
          ))}
        </Physics>
        <OrbitControls enablePan={true} target={[0, 4, 0]} />
      </Canvas>
    </div>
  );
}

export default MarblesDisplay;
