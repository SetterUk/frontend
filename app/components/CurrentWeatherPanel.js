'use client';

import React from 'react';

const CurrentWeatherPanel = ({ currentWeather, location }) => {
  if (!currentWeather || !location) {
    return <div className="text-white">No current weather data available.</div>;
  }

  const { 
    temperature, 
    condition, 
    humidity, 
    windSpeed, 
    feelsLike, 
    wind_kph,
    pressure,
    precipitation,
    cloudCover,
    isDay
  } = currentWeather;
  
  // Handle different location data structures
  let locationName = "Unknown Location";
  if (typeof location === 'string') {
    locationName = location;
  } else if (location.name) {
    locationName = location.name;
  } else if (location.city && location.country) {
    locationName = `${location.city}, ${location.country}`;
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-yellow-400 mb-2">{locationName}</h2>
      <p className="text-5xl font-extrabold mt-2">{temperature}°C</p>
      <p className="text-lg mt-1">Feels like: {feelsLike || temperature}°C</p>
      <p className="text-xl mt-2 capitalize">{condition}</p>
      
      {/* Enhanced weather details */}
      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Humidity:</span>
          <span className="font-bold">{humidity || 'N/A'}%</span>
        </div>
        <div className="flex justify-between">
          <span>Wind:</span>
          <span className="font-bold">{wind_kph || windSpeed || 'N/A'} km/h</span>
        </div>
        {pressure && (
          <div className="flex justify-between">
            <span>Pressure:</span>
            <span className="font-bold">{Math.round(pressure)} hPa</span>
          </div>
        )}
        {precipitation !== undefined && (
          <div className="flex justify-between">
            <span>Precipitation:</span>
            <span className="font-bold">{precipitation} mm</span>
          </div>
        )}
        {cloudCover !== undefined && (
          <div className="flex justify-between">
            <span>Cloud Cover:</span>
            <span className="font-bold">{cloudCover}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentWeatherPanel;