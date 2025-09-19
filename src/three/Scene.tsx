/**
 * Three.js scene with camera, lights, and 3D environment
 */

import { useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  onCameraReady: (camera: THREE.PerspectiveCamera) => void;
  onFrame: (camera: THREE.PerspectiveCamera, deltaTime: number) => void;
}

function SceneContent({ onCameraReady, onFrame }: SceneProps) {
  const { camera } = useThree();

  // Pink sky gradient background (primary to light)
  const BackgroundGradient = () => {
    const shader = useMemo(() => ({
      uniforms: {
        topColor: { value: new THREE.Color('#f4e1ff') }, // primary pink
        bottomColor: { value: new THREE.Color('#f5f5f5') }, // light
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = clamp(vWorldPosition.y / 200.0, 0.0, 1.0);
          vec3 color = mix(bottomColor, topColor, h);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    }), []);
    return (
      <mesh scale={[1, 1, 1]}>
        <sphereGeometry args={[500, 32, 32]} />
        <shaderMaterial args={[shader]} side={THREE.BackSide} />
      </mesh>
    );
  };

  // Generate scattered objects only once using useMemo
  const scatteredObjects = useMemo(() => {
    const objects = [];
    // Theme palette based on provided CSS colors
    const palette = [
      '#f4e1ff', // primary
      '#efd7fd', // secondary
      '#f5f5f5', // tertiary (white-ish)
      '#000000', // black
      '#ffffff', // white (text-tertiary)
      '#ff3434'  // red (text-quinary)
    ];
    const seed = Math.floor(Date.now() / 1000); // Use time-based seed for different positions each load
    
    for (let i = 0; i < 50; i++) {
      // Better random distribution using multiple seeds
      const xSeed = (seed + i * 12345) * 9301 + 49297;
      const zSeed = (seed + i * 54321) * 9301 + 49297;
      const ySeed = (seed + i * 98765) * 9301 + 49297;
      const scaleSeed = (seed + i * 11111) * 9301 + 49297;
      const colorSeed = (seed + i * 22222) * 9301 + 49297;
      const shapeSeed = (seed + i * 33333) * 9301 + 49297;
      
      // Generate positions in a circular area for better distribution
      const angle = (xSeed % 360) * Math.PI / 180;
      const radius = Math.sqrt((zSeed % 10000) / 10000) * 100; // Square root for better distribution
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (ySeed % 5000) / 1000 + 0.5; // 0.5 to 5.5 height
      const scale = (scaleSeed % 1500) / 1000 + 0.5; // 0.5 to 2.0 scale
      const color = palette[colorSeed % palette.length];
      const shape = Math.floor((shapeSeed % 4000) / 1000);
      
      objects.push(
        <mesh key={i} position={[x, y, z]} scale={[scale, scale, scale]}>
          {shape === 0 && <boxGeometry args={[1, 1, 1]} />}
          {shape === 1 && <sphereGeometry args={[0.5, 16, 16]} />}
          {shape === 2 && <coneGeometry args={[0.5, 1, 6]} />}
          {shape === 3 && <cylinderGeometry args={[0.5, 0.5, 1, 8]} />}
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    return objects;
  }, []); // Empty dependency array means this only runs once

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      onCameraReady(camera);
    }
  }, [camera, onCameraReady]);

  useFrame((_, delta) => {
    if (camera instanceof THREE.PerspectiveCamera) {
      onFrame(camera, delta);
    }
  });

  return (
    <>

      {/* Pink sky gradient background */}
      <BackgroundGradient />

      {/* Floor plane with grid */}
      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#303030"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#000000"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* Directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Ambient light */}
      <ambientLight intensity={0.3} />

      {/* Scattered objects for reference */}
      {scatteredObjects}
      
      {/* Some larger reference objects using theme colors */}
      <mesh position={[20, 2, 20]}>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#ff3434" />
      </mesh>

      <mesh position={[-20, 1, 20]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#f4e1ff" />
      </mesh>

      <mesh position={[0, 2, -20]}>
        <coneGeometry args={[2, 4, 8]} />
        <meshStandardMaterial color="#efd7fd" />
      </mesh>

      <mesh position={[30, 1, -30]}>
        <cylinderGeometry args={[2, 2, 2, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      <mesh position={[-30, 1, -30]}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </>
  );
}

export function Scene({ onCameraReady, onFrame }: SceneProps) {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 1, 0], fov: 70 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        tabIndex={0}
        style={{ outline: 'none' }}
        onCreated={({ camera }) => {
          // Set up camera defaults
          if (camera instanceof THREE.PerspectiveCamera) {
            camera.near = 0.1;
            camera.far = 1000;
            camera.rotation.set(0, 0, 0, 'YXZ'); // Look straight ahead
            camera.updateProjectionMatrix();
          }
        }}
      >
        <SceneContent onCameraReady={onCameraReady} onFrame={onFrame} />
      </Canvas>
    </div>
  );
}
