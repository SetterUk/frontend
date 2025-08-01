import React from 'react';
import { useThree } from '@react-three/fiber';

const DynamicLighting = ({ timeOfDay }) => {
  const { scene } = useThree();

  // You can adjust light intensities and colors based on timeOfDay
  // For simplicity, let's just change a directional light's intensity
  // and position.

  // Example: A simple directional light that changes with timeOfDay
  // You might want more sophisticated lighting setups for a full day/night cycle

  return (
    <group>
      {/* Main directional light (e.g., Sun/Moon) */}
      <directionalLight
        position={[0, 10, 5]} // Adjust position as needed
        intensity={timeOfDay === 'night' ? 0.2 : 1} // Dimmer at night
        color={timeOfDay === 'night' ? '#ADD8E6' : '#FFFFFF'} // Bluish at night, white during day
        castShadow
      />

      {/* Ambient light to provide general illumination */}
      <ambientLight intensity={timeOfDay === 'night' ? 0.1 : 0.5} />

      {/* Add other lights as needed, e.g., point lights for city glow at night */}
    </group>
  );
};

export default DynamicLighting;