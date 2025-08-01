'use client';

import React from 'react';

const WeatherDetailsPanel = ({ dailyForecast, hourlyForecast }) => {
  if (!dailyForecast || !hourlyForecast) {
    return <div className="text-white">No forecast data available.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-2">Hourly Forecast:</h3>
      <div className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
        {hourlyForecast.map((hour, index) => (
          <div key={index} className="inline-block text-center mx-2 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm">{new Date(hour.time).getHours()}:00</p>
            <p className="font-bold">{hour.temperature}°C</p>
            <p className="text-xs capitalize">{hour.condition}</p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-4 mb-2">Daily Forecast:</h3>
      <div className="flex-grow overflow-y-auto scrollbar-hide">
        {dailyForecast.map((day, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
            <p className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <p>{day.minTemp}°C / {day.maxTemp}°C</p>
            <p className="capitalize">{day.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherDetailsPanel;