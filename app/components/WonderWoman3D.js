// app/components/characters/WonderWoman3D.js

'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three-stdlib';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Wonder Woman Model Component
export const WonderWomanModel = ({ timeOfDay, weatherCondition }) => {
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);

  const fbx = useLoader(FBXLoader, '/create_a_dc_wonderwoman_sup_0802124914_texture.fbx');

  useEffect(() => {
    if (fbx && !modelLoaded) {
      console.log('Wonder Woman model loaded successfully');
      setModelLoaded(true);
    }

    if (fbx) {
      modelRef.current = fbx;

      fbx.scale.setScalar(0.009);
      fbx.position.set(0, -0.1, 0);
      fbx.rotation.set(0, 0, 0);

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            child.material.emissive = new THREE.Color(timeOfDay === 'night' ? 0x221100 : 0x000000);
            child.material.emissiveIntensity = timeOfDay === 'night' ? 0.08 : 0.04;
            child.material.metalness = 0.4;
            child.material.roughness = 0.5;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [fbx, timeOfDay, modelLoaded]);

  useFrame((state) => {
    if (modelRef.current && modelLoaded) {
      const t = state.clock.elapsedTime;

      modelRef.current.position.y = -0.1 + Math.sin(t * 1.1) * 0.015;
      modelRef.current.position.x = Math.sin(t * 0.5) * 0.01;
      modelRef.current.rotation.z = Math.sin(t * 0.3) * 0.01;

      if (weatherCondition === 'wind') {
        modelRef.current.rotation.x = Math.sin(t * 1.8) * 0.008;
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
      intensity={timeOfDay === 'night' ? 0.6 : 1.5}
      color={timeOfDay === 'night' ? '#FFDAB9' : '#ffffff'}
      castShadow
    />
    <ambientLight intensity={timeOfDay === 'night' ? 0.3 : 0.8} />
    {weatherCondition === 'storm' && (
      <pointLight position={[0, 6, 0]} intensity={0.6} color="#FFD700" distance={10} />
    )}
  </group>
);

// Placeholder while loading
const ModelLoader = () => (
  <mesh position={[1.5, -0.5, 0]} castShadow receiveShadow>
    <boxGeometry args={[0.6, 1.8, 0.4]} />
    <meshStandardMaterial 
      color="#aa3366" 
      emissive="#442211"
      emissiveIntensity={0.1}
    />
  </mesh>
);

// Main Wonder Woman 3D Scene
const WonderWoman3D = ({ timeOfDay, weatherCondition }) => {
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
      <Environment preset={timeOfDay === 'night' ? 'dawn' : 'sunset'} />
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
        <WonderWomanModel timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
      </Suspense>
    </Canvas>
  );
};

export default WonderWoman3D;
