'use client';

import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false); // New state for hydration

  useEffect(() => {
    setMounted(true); // Set mounted to true after initial client render
    const timerId = setInterval(() => {
      setTime(new Date());
       console.log('Current Time:', now.toLocaleString());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Only render the time if the component has mounted on the client
  if (!mounted) {
    return <div className="text-4xl font-bold text-white"></div>; // Render an empty div or placeholder on initial server render
  }

  return (
    <div className="text-4xl font-bold text-white">
      {formatTime(time)}
    </div>
  );
};

export default Clock;