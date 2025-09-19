/**
 * Three.js scene with camera, lights, and 3D environment
 */

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  onCameraReady: (camera: THREE.PerspectiveCamera) => void;
  onFrame: (camera: THREE.PerspectiveCamera, deltaTime: number) => void;
}

function SceneContent({ onCameraReady, onFrame }: SceneProps) {
  const { camera } = useThree();

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

      {/* Sky gradient background */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={10}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Floor plane with grid */}
      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#606060"
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

      {/* Some simple geometry for reference */}
      <mesh position={[5, 1, 5]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>

      <mesh position={[-5, 0.5, 5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#4ecdc4" />
      </mesh>

      <mesh position={[0, 1, -5]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#45b7d1" />
      </mesh>
    </>
  );
}

export function Scene({ onCameraReady, onFrame }: SceneProps) {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 100, 0], fov: 70 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        onCreated={({ camera }) => {
          // Set up camera defaults
          if (camera instanceof THREE.PerspectiveCamera) {
            camera.near = 0.1;
            camera.far = 1000;
            camera.updateProjectionMatrix();
          }
        }}
      >
        <SceneContent onCameraReady={onCameraReady} onFrame={onFrame} />
      </Canvas>
    </div>
  );
}
