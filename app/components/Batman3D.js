'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three-stdlib';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Batman Model Component
export const BatmanModel = ({ timeOfDay, weatherCondition }) => {
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);

  // Correct usage: useLoader must not be inside try/catch or conditionals
  const fbx = useLoader(FBXLoader, '/create_a_bat_man_3d_m_0729145823_texture.fbx');

  useEffect(() => {
    if (fbx && !modelLoaded) {
      console.log('Batman model loaded successfully');
      setModelLoaded(true);
    }
    if (fbx) {
      // Scale the model to a smaller, more appropriate size
      fbx.scale.setScalar(0.01); // Slightly smaller size for better interface balance
      console.log('Batman model scaled to:', fbx.scale);
      // Position Batman in the center, moved upwards
      fbx.position.set(0, -0.1, 0); // Moved upwards from -0.3 to -0.1
      // Remove fixed rotation - Batman will be rotatable on Y-axis
      fbx.rotation.y = 0; // Start facing forward
      fbx.rotation.x = 0; // No tilt
      fbx.rotation.z = 0; // No side tilt
      // Set up materials for better visibility and hero appearance
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Enhance materials based on time of day for heroic appearance
          if (child.material) {
            if (timeOfDay === 'night') {
              child.material.emissive = new THREE.Color(0x001144);
              child.material.emissiveIntensity = 0.15;
              child.material.metalness = 0.3;
              child.material.roughness = 0.7;
            } else {
              child.material.emissive = new THREE.Color(0x000011);
              child.material.emissiveIntensity = 0.05;
              child.material.metalness = 0.2;
              child.material.roughness = 0.8;
            }
          }
        }
      });
    }
  }, [fbx, timeOfDay, modelLoaded]);

  // Animate Batman for conversational interface
  useFrame((state) => {
    if (modelRef.current && modelLoaded) {
      // Subtle breathing/idle animation for lifelike appearance
      const breathingOffset = Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
      modelRef.current.position.y = -0.1 + breathingOffset; // Updated to match new position
      
      // Subtle head movements only (no Y-axis rotation)
      const headNod = Math.sin(state.clock.elapsedTime * 0.4) * 0.01;
      const headTilt = Math.sin(state.clock.elapsedTime * 0.6) * 0.008;
      modelRef.current.rotation.x = headNod; // Subtle head nod
      modelRef.current.rotation.z = headTilt; // Subtle head tilt
      
      // No Y-axis rotation - Batman stays rotatable by user
      // modelRef.current.rotation.y remains unchanged for manual control
      
      // Subtle body movement for lifelike appearance
      const bodyMovement = Math.sin(state.clock.elapsedTime * 0.3) * 0.003;
      modelRef.current.position.x = bodyMovement;
      
      // Weather-based animations (subtle)
      if (weatherCondition === 'storm') {
        // Very subtle storm effects
        modelRef.current.rotation.z = headTilt + Math.sin(state.clock.elapsedTime * 1.5) * 0.005;
      }
      
      // Cape movement simulation during weather (very subtle)
      if (weatherCondition === 'rain' || weatherCondition === 'storm') {
        modelRef.current.rotation.x = headNod + Math.sin(state.clock.elapsedTime * 2) * 0.003;
      }
      
      // Heroic pose adjustments based on time of day (subtle)
      if (timeOfDay === 'night') {
        // Very subtle vigilant pose at night
        const vigilantPose = Math.sin(state.clock.elapsedTime * 0.2) * 0.005;
        modelRef.current.rotation.x = headNod + vigilantPose;
      }
    }
  });

  // Fallback loader if model is not loaded
  if (!fbx) {
    return <ModelLoader />;
  }

  return (
    <primitive 
      ref={modelRef} 
      object={fbx} 
      dispose={null}
    />
  );
};

// Lighting setup for conversational Batman interface
export const DynamicLighting = ({ timeOfDay, weatherCondition }) => {
  return (
    <group>
      {/* Main directional light for Batman visibility */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={timeOfDay === 'night' ? 0.6 : 1.5}
        color={timeOfDay === 'night' ? '#4A90E2' : '#FFFFFF'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Key light to highlight Batman's face and details */}
      <spotLight
        position={[-2, 2, 2]}
        intensity={timeOfDay === 'night' ? 1.0 : 1.5}
        color={timeOfDay === 'night' ? '#6BB6FF' : '#FFFFFF'}
        angle={Math.PI / 6}
        penumbra={0.4}
        castShadow
        target-position={[0, -0.3, 0]} // Focused on Batman's face position
      />

      {/* Fill light to reduce harsh shadows */}
      <pointLight
        position={[-1.5, 0.5, 1.5]}
        intensity={timeOfDay === 'night' ? 0.4 : 0.6}
        color={timeOfDay === 'night' ? '#87CEEB' : '#F0F8FF'}
        distance={6}
      />

      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={timeOfDay === 'night' ? 0.4 : 0.8} />

      {/* Heroic rim lighting for dramatic effect */}
      <directionalLight
        position={[2, 1.5, -1.5]}
        intensity={timeOfDay === 'night' ? 0.5 : 0.7}
        color={timeOfDay === 'night' ? '#1E90FF' : '#FFE4B5'}
      />

      {/* Additional face lighting for conversational interface */}
      <spotLight
        position={[1, 1, 1]}
        intensity={0.8}
        color="#FFFFFF"
        angle={Math.PI / 8}
        penumbra={0.5}
        target-position={[0, -0.3, 0]}
      />

      {/* Weather-specific lighting effects */}
      {weatherCondition === 'storm' && (
        <>
          <pointLight
            position={[0, 6, 0]}
            intensity={0.7}
            color="#87CEEB"
            distance={12}
          />
          {/* Lightning effect simulation */}
          <directionalLight
            position={[8, 10, 2]}
            intensity={0.3}
            color="#E6E6FA"
          />
        </>
      )}
      
      {weatherCondition === 'rain' && (
        <spotLight
          position={[4, 6, 3]}
          intensity={0.5}
          color="#B0C4DE"
          angle={Math.PI / 5}
          penumbra={0.4}
          castShadow
        />
      )}
    </group>
  );
};

// Loading fallback - positioned where Batman will appear
const ModelLoader = () => (
  <mesh position={[1.5, -0.5, 0]} castShadow receiveShadow>
    <boxGeometry args={[0.6, 1.8, 0.4]} />
    <meshStandardMaterial 
      color="#2a2a2a" 
      emissive="#001122"
      emissiveIntensity={0.1}
    />
  </mesh>
);

// Main Batman 3D Component
const Batman3D = ({ timeOfDay, weatherCondition }) => {
  const [use3D, setUse3D] = useState(true);
  const [modelError, setModelError] = useState(false);

  if (modelError || !use3D) {
    return null;
  }

  return (
    <Canvas
      camera={{
        position: [0, 0.2, 3.5], // Closer camera position for more intimate conversation
        fov: 35, // Narrower field of view for better focus on Batman
        near: 0.1,
        far: 1000
      }}
      shadows
      gl={{ 
        antialias: true, 
        alpha: true
        // Removed shadowMap: true, as it causes a TypeError
      }}
      onError={() => setModelError(true)}
    >
      <DynamicLighting timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
      <Environment preset={timeOfDay === 'night' ? 'night' : 'city'} />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        minPolarAngle={Math.PI / 2 - 0.1} // Limit vertical rotation
        maxPolarAngle={Math.PI / 2 + 0.1} // Keep camera level
        minAzimuthAngle={-Math.PI / 2} // Allow full horizontal rotation
        maxAzimuthAngle={Math.PI / 2}
        rotateSpeed={0.5}
      />
      <Suspense fallback={<ModelLoader />}>
        <BatmanModel 
          timeOfDay={timeOfDay}
          weatherCondition={weatherCondition}
        />
      </Suspense>
    </Canvas>
  );
};

export default Batman3D;