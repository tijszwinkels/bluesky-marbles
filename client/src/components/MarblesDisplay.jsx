import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, useSphere, usePlane, useBox } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';
import './MarblesDisplay.css';

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
        transmission={0.9}
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
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

function VaseWall({ position, rotation, args }) {
  const [ref] = useBox(() => ({
    args,
    position,
    rotation,
    type: 'Static',
  }));

  return (
    <mesh ref={ref}>
      <boxGeometry args={args} />
      <meshPhysicalMaterial 
        color="#ffffff"
        transparent={true}
        opacity={0.3}
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
  const bottomWidth = 4;
  const topWidth = 6;
  const wallHeight = height;

  return (
    <group position={[0, 4, 0]}>
      {/* Front wall */}
      <VaseWall 
        position={[0, 0, topWidth/2]} 
        rotation={[0.2, 0, 0]}
        args={[topWidth, wallHeight, thickness]}
      />
      {/* Back wall */}
      <VaseWall 
        position={[0, 0, -topWidth/2]} 
        rotation={[-0.2, 0, 0]}
        args={[topWidth, wallHeight, thickness]}
      />
      {/* Left wall */}
      <VaseWall 
        position={[-topWidth/2, 0, 0]} 
        rotation={[0, 0, -0.2]}
        args={[thickness, wallHeight, topWidth]}
      />
      {/* Right wall */}
      <VaseWall 
        position={[topWidth/2, 0, 0]} 
        rotation={[0, 0, 0.2]}
        args={[thickness, wallHeight, topWidth]}
      />
    </group>
  );
}

function MarblesDisplay({ messages, timeout = 60, marbleSize = 0.2, fadeEnabled = true }) {
  const [marbles, setMarbles] = useState([]);
  const marbleCountRef = useRef(0);

  useEffect(() => {
    if (messages.length === 0) return;

    // Add a new marble for the latest message
    const lastMessage = messages[messages.length - 1];
    marbleCountRef.current += 1;
    const newMarble = {
      id: `marble-${Date.now()}-${marbleCountRef.current}`, // Ensure unique ID
      timestamp: Date.now(),
      position: [Math.random() * 4 - 2, 12, Math.random() * 4 - 2], // Random position at the top
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
    };

    setMarbles((prevMarbles) => [...prevMarbles, newMarble]);

    // Remove marbles older than timeout
    const now = Date.now();
    setMarbles((prevMarbles) =>
      prevMarbles.filter((marble) => now - marble.timestamp < timeout * 1000)
    );
  }, [messages, timeout]);

  // Calculate opacity based on remaining time and fade setting
  const getOpacity = (timestamp) => {
    if (!fadeEnabled) return 1;
    const age = Date.now() - timestamp;
    const remainingTime = (timeout * 1000) - age;
    return Math.max(0.2, remainingTime / (timeout * 1000));
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
