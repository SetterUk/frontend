'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three-stdlib';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Superman Model Component
export const SupermanModel = ({ timeOfDay, weatherCondition }) => {
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);

  const fbx = useLoader(FBXLoader, '/create_a_dc_superman_sup_0802102040_texture.fbx');

  useEffect(() => {
    if (fbx && !modelLoaded) {
      console.log('Superman model loaded successfully');
      setModelLoaded(true);
    }

    if (fbx) {
      // ✅ Set ref so useFrame works
      modelRef.current = fbx;

      // ✅ Scale down for proper alignment (like Batman)
      fbx.scale.setScalar(0.0093);
      fbx.position.set(0, -0.1, 0);
      fbx.rotation.set(0, 0, 0);

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.emissive = new THREE.Color(timeOfDay === 'night' ? 0x000022 : 0x000000);
            child.material.emissiveIntensity = timeOfDay === 'night' ? 0.1 : 0.05;
            child.material.metalness = 0.25;
            child.material.roughness = 0.7;
          }
        }
      });
    }
  }, [fbx, timeOfDay, modelLoaded]);

  useFrame((state) => {
    if (modelRef.current && modelLoaded) {
      const floatY = Math.sin(state.clock.elapsedTime * 1.2) * 0.015;
      modelRef.current.position.y = -0.1 + floatY;

      const bobX = Math.sin(state.clock.elapsedTime * 0.6) * 0.01;
      modelRef.current.position.x = bobX;

      const idleTilt = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      modelRef.current.rotation.z = idleTilt;

      if (weatherCondition === 'wind') {
        modelRef.current.rotation.x = idleTilt + Math.sin(state.clock.elapsedTime * 2.0) * 0.005;
      }
    }
  });

  if (!fbx) return <ModelLoader />;

  return <primitive ref={modelRef} object={fbx} dispose={null} />;
};

// Dynamic Lighting
const DynamicLighting = ({ timeOfDay, weatherCondition }) => (
  <group>
    <directionalLight
      position={[5, 8, 5]}
      intensity={timeOfDay === 'night' ? 0.7 : 1.8}
      color={timeOfDay === 'night' ? '#89CFF0' : '#FFFFFF'}
      castShadow
    />
    <ambientLight intensity={timeOfDay === 'night' ? 0.4 : 0.9} />
    {weatherCondition === 'storm' && (
      <pointLight position={[0, 6, 0]} intensity={0.6} color="#87CEEB" distance={10} />
    )}
  </group>
);

// Placeholder while loading
const ModelLoader = () => (
  <mesh position={[1.5, -0.5, 0]} castShadow receiveShadow>
    <boxGeometry args={[0.6, 1.8, 0.4]} />
    <meshStandardMaterial 
      color="#3344aa" 
      emissive="#112244"
      emissiveIntensity={0.1}
    />
  </mesh>
);

// Main Superman 3D Scene
const Superman3D = ({ timeOfDay, weatherCondition }) => {
  const [modelError, setModelError] = useState(false);

  if (modelError) return null;

  return (
    <Canvas
      camera={{
        position: [0, 0.2, 3.5],
        fov: 35,
        near: 0.1,
        far: 1000
      }}
      shadows
      gl={{ antialias: true, alpha: true }}
      onError={() => setModelError(true)}
    >
      <DynamicLighting timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
      <Environment preset={timeOfDay === 'night' ? 'night' : 'sunset'} />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        minPolarAngle={Math.PI / 2 - 0.1}
        maxPolarAngle={Math.PI / 2 + 0.1}
        rotateSpeed={0.5}
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
      />
      <Suspense fallback={<ModelLoader />}>
        <SupermanModel timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
      </Suspense>
    </Canvas>
  );
};

export default Superman3D;
