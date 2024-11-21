import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';

function Marble({ position, color, opacity, size }) {
  const [ref] = useSphere(() => ({
    mass: 1,
    position,
    args: [size], // Radius of the sphere
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.3} 
        roughness={0.2}
        transparent={true}
        opacity={opacity} 
      />
    </mesh>
  );
}

function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

function Walls() {
  const wallProps = [
    { position: [0, 1, -5], rotation: [0, 0, 0] }, // Back wall
    { position: [-5, 1, 0], rotation: [0, Math.PI / 2, 0] }, // Left wall
    { position: [5, 1, 0], rotation: [0, -Math.PI / 2, 0] }, // Right wall
  ];

  return (
    <>
      {wallProps.map((props, index) => {
        const [ref] = usePlane(() => ({
          ...props,
          type: 'Static',
        }));

        return (
          <mesh key={index} ref={ref} receiveShadow>
            <planeGeometry args={[10, 6]} />
            <meshStandardMaterial color="#f0f0f0" side={2} transparent opacity={0.3} />
          </mesh>
        );
      })}
    </>
  );
}

function MarblesDisplay({ messages, timeout = 60, marbleSize = 0.2 }) {
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
      position: [Math.random() * 4 - 2, 6, Math.random() * 4 - 2], // Random position at the top
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
    };

    setMarbles((prevMarbles) => [...prevMarbles, newMarble]);

    // Remove marbles older than timeout
    const now = Date.now();
    setMarbles((prevMarbles) =>
      prevMarbles.filter((marble) => now - marble.timestamp < timeout * 1000)
    );
  }, [messages, timeout]);

  // Calculate opacity based on remaining time
  const getOpacity = (timestamp) => {
    const age = Date.now() - timestamp;
    const remainingTime = (timeout * 1000) - age;
    return Math.max(0.2, remainingTime / (timeout * 1000));
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#f5f5f5' }}>
      <Canvas shadows camera={{ position: [0, 10, 15], fov: 45 }}>
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
          <Walls />
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
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}

export default MarblesDisplay;
