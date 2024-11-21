import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';

function Marble({ position, color }) {
  const [ref] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.2], // Radius of the sphere
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.2} />
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

function MarblesDisplay({ messages }) {
  const [marbles, setMarbles] = useState([]);

  useEffect(() => {
    if (messages.length === 0) return;

    // Add a new marble for the latest message
    const lastMessage = messages[messages.length - 1];
    const newMarble = {
      id: lastMessage.id || Date.now(),
      timestamp: Date.now(),
      position: [Math.random() * 4 - 2, 6, Math.random() * 4 - 2], // Random position at the top
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
    };

    setMarbles((prevMarbles) => [...prevMarbles, newMarble]);

    // Remove marbles older than 1 minute
    const now = Date.now();
    setMarbles((prevMarbles) =>
      prevMarbles.filter((marble) => now - marble.timestamp < 60000)
    );
  }, [messages]);

  return (
    <div style={{ height: '600px', width: '100%', background: '#f5f5f5' }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
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
            />
          ))}
        </Physics>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}

export default MarblesDisplay;
