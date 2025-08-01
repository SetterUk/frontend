'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Batman3D from './Batman3D';
import BatmanSilhouette from './BatmanSilhouette';

const WatchtowerBackground = ({ weather, location, currentHero }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  // Calculate time of day based on current time
  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  };

  // Get weather condition for animations
  const getWeatherCondition = () => {
    if (!weather) return 'clear';
    
    // Check if we have a condition text to parse
    const condition = weather.condition?.toLowerCase() || '';
    
    // Rain conditions
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
      return 'rain';
    }
    
    // Snow conditions
    if (condition.includes('snow')) {
      return 'snow';
    }
    
    // Storm conditions
    if (condition.includes('thunderstorm') || condition.includes('storm')) {
      return 'storm';
    }
    
    // Fog conditions
    if (condition.includes('fog') || condition.includes('mist')) {
      return 'fog';
    }
    
    // Cloudy conditions
    if (condition.includes('cloud') || condition.includes('overcast')) {
      return 'cloudy';
    }
    
    // Clear conditions
    if (condition.includes('clear') || condition.includes('sunny')) {
      return 'clear';
    }
    
    // Default to clear
    return 'clear';
  };

  const timeOfDay = getTimeOfDay();
  const weatherCondition = getWeatherCondition();
  
  // Debug logging
  console.log('Weather Animation Debug:', {
    weather: weather,
    condition: weather?.condition,
    weatherCondition: weatherCondition,
    timeOfDay: timeOfDay
  });

  // Sky gradient colors based on time of day
  const skyGradients = {
    morning: 'from-orange-300 via-yellow-200 to-blue-300',
    afternoon: 'from-blue-400 via-blue-300 to-blue-200',
    evening: 'from-purple-500 via-pink-400 to-orange-300',
    night: 'from-indigo-900 via-purple-900 to-black'
  };

  // Get opacity based on weather condition
  const getSkyOpacity = () => {
    if (weatherCondition === 'storm') return 0.8;
    if (weatherCondition === 'rain') return 0.6;
    if (weatherCondition === 'cloudy') return 0.5;
    if (weatherCondition === 'fog') return 0.7;
    return timeOfDay === 'night' ? 0.7 : 0.4;
  };

  // Generate rain drops
  const rainDrops = Array.from({ length: 100 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-0.5 h-4 bg-blue-300 opacity-60"
      style={{
        left: `${Math.random() * 100}%`,
        top: `-20px`,
      }}
      animate={{
        y: ['0vh', '120vh'],
        opacity: [0, 0.8, 0]
      }}
      transition={{
        duration: Math.random() * 1 + 0.5,
        repeat: Infinity,
        delay: Math.random() * 2,
        ease: 'linear'
      }}
    />
  ));

  // Generate snow flakes
  const snowFlakes = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-white rounded-full opacity-80"
      style={{
        left: `${Math.random() * 100}%`,
        top: `-20px`,
      }}
      animate={{
        y: ['0vh', '120vh'],
        x: [0, Math.random() * 50 - 25],
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: 'easeInOut'
      }}
    />
  ));

  // Generate clouds
  const clouds = Array.from({ length: 5 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute opacity-40"
      style={{
        left: `${Math.random() * 120 - 20}%`,
        top: `${Math.random() * 30 + 10}%`,
        fontSize: `${Math.random() * 40 + 60}px`
      }}
      animate={{
        x: ['-100px', '100vw'],
      }}
      transition={{
        duration: Math.random() * 20 + 30,
        repeat: Infinity,
        ease: 'linear',
        delay: Math.random() * 10
      }}
    >
      ☁️
    </motion.div>
  ));

  // Lightning effect for storms
  const Lightning = () => (
    <motion.div
      className="absolute inset-0 bg-white pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0] }}
      transition={{
        duration: 0.2,
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 3
      }}
    />
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base Watchtower Background and other effects */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/watchtower-bg.jpg)' }}
      />
      
      {/* Sky Overlay with Time-based Gradient */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-b ${skyGradients[timeOfDay]}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: getSkyOpacity() }}
        transition={{ duration: 2 }}
      />

      {/* Sun */}
      {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && (
        <motion.div
          className="absolute w-20 h-20 bg-yellow-300 rounded-full shadow-2xl"
          style={{
            top: timeOfDay === 'morning' ? '20%' : '15%',
            right: timeOfDay === 'morning' ? '70%' : '20%',
            boxShadow: '0 0 100px rgba(255, 255, 0, 0.5)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360]
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity },
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
          }}
        />
      )}

      {/* Moon */}
      {timeOfDay === 'night' && (
        <motion.div
          className="absolute w-16 h-16 bg-gray-100 rounded-full"
          style={{
            top: '15%',
            right: '20%',
            boxShadow: '0 0 50px rgba(255, 255, 255, 0.3)'
          }}
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity
          }}
        >
          {/* Moon craters */}
          <div className="absolute w-2 h-2 bg-gray-300 rounded-full top-2 left-3 opacity-50" />
          <div className="absolute w-1 h-1 bg-gray-300 rounded-full top-4 right-3 opacity-50" />
          <div className="absolute w-1.5 h-1.5 bg-gray-300 rounded-full bottom-3 left-2 opacity-50" />
        </motion.div>
      )}

      {/* Stars (only at night) */}
      {timeOfDay === 'night' && isClient && ( // Conditionally render stars
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}

      {/* Weather Effects */}
      {weatherCondition === 'rain' && isClient && ( // Conditionally render rain
        <div className="absolute inset-0">
          {rainDrops}
        </div>
      )}

      {weatherCondition === 'snow' && isClient && ( // Conditionally render snow
        <div className="absolute inset-0">
          {snowFlakes}
        </div>
      )}

      {weatherCondition === 'storm' && isClient && ( // Conditionally render storm effects
        <>
          <div className="absolute inset-0">
            {rainDrops}
          </div>
          <Lightning />
        </>
      )}

      {(weatherCondition === 'cloudy' || weatherCondition === 'fog') && isClient && ( // Conditionally render clouds
        <div className="absolute inset-0">
          {clouds}
        </div>
      )}

      {/* Fog Effect */}
      {weatherCondition === 'fog' && (
        <motion.div
          className="absolute inset-0 bg-gray-400"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      {/* Wind Effect (subtle particle movement) */}
      {weather && (weather.windSpeed || weather.wind_kph) > 15 && isClient && ( // Conditionally render wind particles
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white opacity-20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 200],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'linear'
              }}
            />
          ))}
        </div>
      )}

      {/* Time-based lighting overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: timeOfDay === 'night' 
            ? 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            : timeOfDay === 'morning'
            ? 'radial-gradient(circle at 70% 20%, rgba(255,255,0,0.2) 0%, transparent 50%)'
            : timeOfDay === 'evening'
            ? 'radial-gradient(circle at 20% 30%, rgba(255,100,0,0.15) 0%, transparent 60%)'
            : 'none'
        }}
      />

      {/* Atmospheric particles */}
      {isClient && ( // Conditionally render atmospheric particles
        <div className="absolute inset-0">
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white opacity-20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Watchtower beacon light effect */}
      {timeOfDay === 'night' && (
        <motion.div
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <div 
            className="w-2 h-96 bg-gradient-to-t from-transparent via-yellow-300/30 to-transparent"
            style={{
              transformOrigin: 'center bottom',
              filter: 'blur(2px)'
            }}
          />
        </motion.div>
      )}

      {/* Batman 3D Model - Try to load FBX, fallback to silhouette */}
      {isClient && currentHero === 'batman' && (
        <>
          {/* Use 3D model for desktop and silhouette for mobile */}
          {!isMobile ? (
            <Batman3D timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
          ) : (
            <BatmanSilhouette timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
          )}
        </>
      )}
    </div>
  );
};

export default WatchtowerBackground;