'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three-stdlib';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Aquaman Model Component
export const AquamanModel = ({ timeOfDay, weatherCondition }) => {
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);

  // Load Aquaman model - you'll need to add the actual model file
  const fbx = useLoader(FBXLoader, '/create_a_dc_aquaman_s_0729195053_texture.fbx'); // Update with actual file path

  useEffect(() => {
    if (fbx && !modelLoaded) {
      console.log('Aquaman model loaded successfully');
      setModelLoaded(true);
    }
    if (fbx) {
      // Scale the model to a smaller, more appropriate size
      fbx.scale.setScalar(0.01); // Slightly smaller size for better interface balance
      // Position Aquaman in the center, moved upwards
      fbx.position.set(0, -0.1, 0); // Moved upwards from -0.3 to -0.1
      // Remove fixed rotation - Aquaman will be rotatable on Y-axis
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
              child.material.emissive = new THREE.Color(0x004466); // Ocean blue
              child.material.emissiveIntensity = 0.08;
              child.material.metalness = 0.4;
              child.material.roughness = 0.6;
            } else {
              child.material.emissive = new THREE.Color(0x002244);
              child.material.emissiveIntensity = 0.02;
              child.material.metalness = 0.3;
              child.material.roughness = 0.7;
            }
          }
        }
      });
    }
  }, [fbx, timeOfDay, modelLoaded]);

  // Animate Aquaman for conversational interface with ocean themes
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
      
      // No Y-axis rotation - Aquaman stays rotatable by user
      // modelRef.current.rotation.y remains unchanged for manual control
      
      // Subtle body movement for lifelike appearance
      const bodyMovement = Math.sin(state.clock.elapsedTime * 0.3) * 0.003;
      modelRef.current.position.x = bodyMovement;
      
      // Ocean-themed animations for rain/storm
      if (weatherCondition === 'rain' || weatherCondition === 'storm') {
        // More pronounced movements during rain - Aquaman feels at home
        const oceanMovement = Math.sin(state.clock.elapsedTime * 1.2) * 0.005;
        modelRef.current.rotation.x = headNod + oceanMovement;
        modelRef.current.rotation.z = headTilt + Math.sin(state.clock.elapsedTime * 0.8) * 0.003;
      }
      
      // Regal pose adjustments for Aquaman
      if (timeOfDay === 'night') {
        // More regal, commanding pose at night
        const regalPose = Math.sin(state.clock.elapsedTime * 0.2) * 0.005;
        modelRef.current.rotation.x = headNod + regalPose;
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

// Ocean-themed lighting setup for Aquaman
export const OceanLighting = ({ timeOfDay, weatherCondition }) => {
  return (
    <group>
      {/* Main directional light for Aquaman visibility */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={timeOfDay === 'night' ? 0.4 : 0.8}
        color={timeOfDay === 'night' ? '#0066CC' : '#87CEEB'} // Ocean blue tones
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Key light to highlight Aquaman's face and details */}
      <spotLight
        position={[-2, 2, 2]}
        intensity={timeOfDay === 'night' ? 0.6 : 0.8}
        color={timeOfDay === 'night' ? '#4A90E2' : '#B0E0E6'} // Ocean colors
        angle={Math.PI / 6}
        penumbra={0.4}
        castShadow
        target-position={[0, -0.3, 0]} // Focused on Aquaman's face position
      />

      {/* Fill light to reduce harsh shadows */}
      <pointLight
        position={[-1.5, 0.5, 1.5]}
        intensity={timeOfDay === 'night' ? 0.2 : 0.3}
        color={timeOfDay === 'night' ? '#4682B4' : '#E0F6FF'} // Steel blue tones
        distance={6}
      />

      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={timeOfDay === 'night' ? 0.2 : 0.4} />

      {/* Ocean rim lighting for dramatic effect */}
      <directionalLight
        position={[2, 1.5, -1.5]}
        intensity={timeOfDay === 'night' ? 0.3 : 0.4}
        color={timeOfDay === 'night' ? '#1E3A8A' : '#87CEEB'} // Deep ocean blue
      />

      {/* Additional face lighting for conversational interface */}
      <spotLight
        position={[1, 1, 1]}
        intensity={0.4}
        color="#B0E0E6" // Powder blue
        angle={Math.PI / 8}
        penumbra={0.5}
        target-position={[0, -0.3, 0]}
      />

      {/* Rain/storm specific lighting effects */}
      {weatherCondition === 'rain' && (
        <>
          <pointLight
            position={[0, 6, 0]}
            intensity={0.3}
            color="#4682B4" // Steel blue
            distance={12}
          />
          <spotLight
            position={[4, 6, 3]}
            intensity={0.2}
            color="#5F9EA0" // Cadet blue
            angle={Math.PI / 5}
            penumbra={0.4}
            castShadow
          />
        </>
      )}
      
      {weatherCondition === 'storm' && (
        <>
          <pointLight
            position={[0, 6, 0]}
            intensity={0.4}
            color="#2E4A6B" // Dark ocean blue
            distance={12}
          />
          {/* Lightning effect simulation */}
          <directionalLight
            position={[8, 10, 2]}
            intensity={0.2}
            color="#87CEEB" // Sky blue
          />
        </>
      )}
    </group>
  );
};

// Loading fallback - positioned where Aquaman will appear
const ModelLoader = () => (
  <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
    <boxGeometry args={[0.6, 1.8, 0.4]} />
    <meshStandardMaterial 
      color="#0066CC" 
      emissive="#004466"
      emissiveIntensity={0.1}
    />
  </mesh>
);

// Main Aquaman 3D Component
const Aquaman3D = ({ timeOfDay, weatherCondition }) => {
  const [use3D, setUse3D] = useState(true);
  const [modelError, setModelError] = useState(false);

  if (modelError || !use3D) {
    return null;
  }

  return (
    <Canvas
      camera={{
        position: [0, 0.2, 3.5], // Closer camera position for more intimate conversation
        fov: 35, // Narrower field of view for better focus on Aquaman
        near: 0.1,
        far: 1000
      }}
      shadows
      gl={{ 
        antialias: true, 
        alpha: true
      }}
      onError={() => setModelError(true)}
    >
      <OceanLighting timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
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
        <AquamanModel 
          timeOfDay={timeOfDay}
          weatherCondition={weatherCondition}
        />
      </Suspense>
    </Canvas>
  );
};

export default Aquaman3D; 