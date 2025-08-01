'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three-stdlib';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Flash Model Component
export const FlashModel = ({ timeOfDay, weatherCondition }) => {
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);

  // Load Flash model - you'll need to add the actual model file
  const fbx = useLoader(FBXLoader, '/create_a_dc_flash_sup_0729194130_texture.fbx'); // Update with actual file path

  useEffect(() => {
    if (fbx && !modelLoaded) {
      console.log('Flash model loaded successfully');
      setModelLoaded(true);
    }
    if (fbx) {
      // Scale the model to a smaller, more appropriate size
      fbx.scale.setScalar(0.008); // Reduced size for better interface balance
      // Position Flash in the center, moved upwards
      fbx.position.set(0, -0.1, 0); // Moved upwards from -0.3 to -0.1
      // Remove fixed rotation - Flash will be rotatable on Y-axis
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
              child.material.emissive = new THREE.Color(0xCC6600); // Warm orange
              child.material.emissiveIntensity = 0.12;
              child.material.metalness = 0.5;
              child.material.roughness = 0.5;
            } else {
              child.material.emissive = new THREE.Color(0xAA5500);
              child.material.emissiveIntensity = 0.06;
              child.material.metalness = 0.4;
              child.material.roughness = 0.6;
            }
          }
        }
      });
    }
  }, [fbx, timeOfDay, modelLoaded]);

  // Animate Flash for conversational interface with speed themes
  useFrame((state) => {
    if (modelRef.current && modelLoaded) {
      // Energetic breathing animation for Flash
      const breathingOffset = Math.sin(state.clock.elapsedTime * 1.2) * 0.015;
      modelRef.current.position.y = -0.1 + breathingOffset; // Updated to match new position
      
      // Quick, energetic head movements
      const headNod = Math.sin(state.clock.elapsedTime * 0.8) * 0.015;
      const headTilt = Math.sin(state.clock.elapsedTime * 1.0) * 0.012;
      modelRef.current.rotation.x = headNod; // Energetic head nod
      modelRef.current.rotation.z = headTilt; // Quick head tilt
      
      // No Y-axis rotation - Flash stays rotatable by user
      // modelRef.current.rotation.y remains unchanged for manual control
      
      // Energetic body movement for Flash
      const bodyMovement = Math.sin(state.clock.elapsedTime * 0.6) * 0.005;
      modelRef.current.position.x = bodyMovement;
      
      // Speed-themed animations for windy conditions
      if (weatherCondition === 'windy' || weatherCondition === 'storm') {
        // More energetic movements during wind - Flash feels the speed
        const speedMovement = Math.sin(state.clock.elapsedTime * 2.0) * 0.008;
        modelRef.current.rotation.x = headNod + speedMovement;
        modelRef.current.rotation.z = headTilt + Math.sin(state.clock.elapsedTime * 1.5) * 0.005;
        // Quick side-to-side movement
        modelRef.current.position.x = bodyMovement + Math.sin(state.clock.elapsedTime * 1.8) * 0.003;
      }
      
      // Energetic pose adjustments for Flash
      if (timeOfDay === 'night') {
        // More energetic, vigilant pose at night
        const energeticPose = Math.sin(state.clock.elapsedTime * 0.4) * 0.008;
        modelRef.current.rotation.x = headNod + energeticPose;
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

// Lightning-themed lighting setup for Flash
export const LightningLighting = ({ timeOfDay, weatherCondition }) => {
  return (
    <group>
      {/* Main directional light for Flash visibility */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={timeOfDay === 'night' ? 0.4 : 0.8}
        color={timeOfDay === 'night' ? '#CC6600' : '#FF8800'} // Warm orange-red colors
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Key light to highlight Flash's face and details */}
      <spotLight
        position={[-2, 2, 2]}
        intensity={timeOfDay === 'night' ? 0.6 : 0.8}
        color={timeOfDay === 'night' ? '#DD7700' : '#FFAA00'} // Warm orange-red colors
        angle={Math.PI / 6}
        penumbra={0.4}
        castShadow
        target-position={[0, -0.3, 0]} // Focused on Flash's face position
      />

      {/* Fill light to reduce harsh shadows */}
      <pointLight
        position={[-1.5, 0.5, 1.5]}
        intensity={timeOfDay === 'night' ? 0.3 : 0.4}
        color={timeOfDay === 'night' ? '#AA5500' : '#CC6600'} // Warm orange tones
        distance={6}
      />

      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={timeOfDay === 'night' ? 0.3 : 0.5} />

      {/* Warm rim lighting for dramatic effect */}
      <directionalLight
        position={[2, 1.5, -1.5]}
        intensity={timeOfDay === 'night' ? 0.4 : 0.5}
        color={timeOfDay === 'night' ? '#884400' : '#AA6600'} // Warm orange
      />

      {/* Additional face lighting for conversational interface */}
      <spotLight
        position={[1, 1, 1]}
        intensity={0.5}
        color="#FFAA00" // Warm orange
        angle={Math.PI / 8}
        penumbra={0.5}
        target-position={[0, -0.3, 0]}
      />

      {/* Wind/storm specific lighting effects */}
      {weatherCondition === 'windy' && (
        <>
          <pointLight
            position={[0, 6, 0]}
            intensity={0.4}
            color="#CC6600" // Warm orange
            distance={12}
          />
          <spotLight
            position={[4, 6, 3]}
            intensity={0.3}
            color="#DD7700" // Warm orange-red
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
            intensity={0.5}
            color="#AA5500" // Warm orange
            distance={12}
          />
          {/* Lightning effect simulation */}
          <directionalLight
            position={[8, 10, 2]}
            intensity={0.3}
            color="#CC6600" // Warm orange
          />
        </>
      )}
    </group>
  );
};

// Loading fallback - positioned where Flash will appear
const ModelLoader = () => (
  <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
    <boxGeometry args={[0.6, 1.8, 0.4]} />
    <meshStandardMaterial 
      color="#CC6600" 
      emissive="#AA5500"
      emissiveIntensity={0.12}
    />
  </mesh>
);

// Main Flash 3D Component
const Flash3D = ({ timeOfDay, weatherCondition }) => {
  const [use3D, setUse3D] = useState(true);
  const [modelError, setModelError] = useState(false);

  if (modelError || !use3D) {
    return null;
  }

  return (
    <Canvas
      camera={{
        position: [0, 0.2, 3.5], // Closer camera position for more intimate conversation
        fov: 35, // Narrower field of view for better focus on Flash
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
      <LightningLighting timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
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
        <FlashModel 
          timeOfDay={timeOfDay}
          weatherCondition={weatherCondition}
        />
      </Suspense>
    </Canvas>
  );
};

export default Flash3D; 