'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const BatmanSilhouette = ({ timeOfDay, weatherCondition }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Batman silhouette SVG
  const BatmanSVG = () => (
    <svg
      width="120"
      height="180"
      viewBox="0 0 120 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-2xl"
    >
      {/* Batman silhouette */}
      <path
        d="M60 20 C50 15, 40 20, 35 30 C30 25, 20 30, 15 40 C10 35, 5 45, 10 55 C15 50, 25 55, 30 65 L30 80 C25 85, 20 95, 25 105 L35 100 C40 110, 50 115, 60 120 C70 115, 80 110, 85 100 L95 105 C100 95, 95 85, 90 80 L90 65 C95 55, 105 50, 110 55 C115 45, 110 35, 105 40 C100 30, 90 25, 85 30 C80 20, 70 15, 60 20 Z"
        fill={timeOfDay === 'night' ? '#000033' : '#1a1a1a'}
        stroke={timeOfDay === 'night' ? '#4488ff' : '#333'}
        strokeWidth="1"
      />
      {/* Cape */}
      <path
        d="M30 65 C25 75, 20 85, 15 95 C10 105, 5 115, 10 125 C15 135, 25 145, 35 155 C45 165, 55 170, 60 175 C65 170, 75 165, 85 155 C95 145, 105 135, 110 125 C115 115, 110 105, 105 95 C100 85, 95 75, 90 65"
        fill={timeOfDay === 'night' ? '#000022' : '#0a0a0a'}
        stroke={timeOfDay === 'night' ? '#2266aa' : '#222'}
        strokeWidth="1"
      />
      {/* Eyes glow effect for night */}
      {timeOfDay === 'night' && (
        <>
          <circle cx="52" cy="35" r="2" fill="#00aaff" className="animate-pulse" />
          <circle cx="68" cy="35" r="2" fill="#00aaff" className="animate-pulse" />
        </>
      )}
    </svg>
  );

  // Position based on time of day
  const getPosition = () => {
    switch (timeOfDay) {
      case 'morning':
        return { right: '15%', top: '25%' };
      case 'afternoon':
        return { right: '20%', top: '30%' };
      case 'evening':
        return { right: '10%', top: '20%' };
      case 'night':
      default:
        return { right: '12%', top: '15%' };
    }
  };

  const position = getPosition();

  return (
    <motion.div
      className="absolute z-20"
      style={position}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: weatherCondition === 'storm' ? [0, -5, 0] : [0, -2, 0]
      }}
      transition={{ 
        opacity: { duration: 2 },
        scale: { duration: 2 },
        y: { 
          duration: weatherCondition === 'storm' ? 2 : 4, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }
      }}
    >
      {/* Batman figure with cape animation */}
      <motion.div
        animate={{
          rotateY: weatherCondition === 'storm' ? [-2, 2, -2] : [0],
          rotateZ: weatherCondition === 'rain' ? [-1, 1, -1] : [0]
        }}
        transition={{
          duration: weatherCondition === 'storm' ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <BatmanSVG />
      </motion.div>

      {/* Glow effect for night time */}
      {timeOfDay === 'night' && (
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(68,136,255,0.2) 0%, transparent 70%)',
              filter: 'blur(10px)'
            }}
          />
        </motion.div>
      )}

      {/* Lightning effect during storms */}
      {weatherCondition === 'storm' && (
        <motion.div
          className="absolute inset-0 -z-5"
          animate={{
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 2
          }}
        >
          <div 
            className="w-full h-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 50%)',
              filter: 'blur(5px)'
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default BatmanSilhouette;