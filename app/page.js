'use client';
import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import WatchtowerBackground from './components/WatchtowerBackground';
import Batman3D from './components/Batman3D';
import Aquaman3D from './components/Aquaman3D';
import Flash3D from './components/Flash3D';

import CurrentWeatherPanel from './components/CurrentWeatherPanel';
import WeatherDetailsPanel from './components/WeatherDetailsPanel';
import LocationManager from './components/LocationManager';
import JusticeLeagueBootLoader from './components/JusticeLeagueBootLoader';
import * as THREE from 'three';

export default function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const [heroImage, setHeroImage] = useState('/watchtower-bg.jpg');
  const [weatherAnimation, setWeatherAnimation] = useState('');
  const [dayNightClass, setDayNightClass] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day', 'night', 'dawn', 'dusk'
  const [weatherCondition, setWeatherCondition] = useState('clear'); // e.g., 'clear', 'rain', 'storm', 'snow'
  const [currentHero, setCurrentHero] = useState('batman'); // Track current hero
  const [isInitialLoading, setIsInitialLoading] = useState(true); // For the boot loader
  const [showBootLoader, setShowBootLoader] = useState(true);

  // New states for location management
  const [savedLocations, setSavedLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [showLocationManager, setShowLocationManager] = useState(false);
  
  // Function to determine which hero to display based on weather
  const getHeroForWeather = (condition, timeOfDay, windSpeed) => {
    const conditionLower = condition.toLowerCase();
    
    console.log('Hero Selection Debug:', {
      condition: condition,
      conditionLower: conditionLower,
      timeOfDay: timeOfDay,
      windSpeed: windSpeed
    });
    
    // Aquaman for water-related weather (highest priority)
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || 
        conditionLower.includes('shower') || conditionLower.includes('storm')) {
      console.log('Selected Hero: Aquaman (water weather)');
      return 'aquaman';
    }
    
    // Flash for windy conditions (second priority)
    if (conditionLower.includes('wind') || (windSpeed && windSpeed > 25)) {
      console.log('Selected Hero: Flash (windy conditions) - Wind speed:', windSpeed);
      return 'flash';
    }
    
    // Batman for night or clear conditions (lowest priority)
    if (timeOfDay === 'night' || conditionLower.includes('clear') || 
        conditionLower.includes('cloud') || conditionLower.includes('fog')) {
      console.log('Selected Hero: Batman (night/clear weather)');
      return 'batman';
    }
    
    // Default to Batman
    console.log('Selected Hero: Batman (default)');
    return 'batman';
  };
  
  // Update current hero when weather conditions change
  useEffect(() => {
    if (dashboardData?.currentWeather?.condition) {
      const windSpeed = parseFloat(dashboardData.currentWeather.windSpeed || dashboardData.currentWeather.wind_kph || 0);
      const newHero = getHeroForWeather(
        dashboardData.currentWeather.condition,
        timeOfDay,
        windSpeed
      );
      console.log('Hero Selection Debug:', {
        condition: dashboardData.currentWeather.condition,
        timeOfDay: timeOfDay,
        windSpeed: windSpeed,
        windSpeedType: typeof windSpeed,
        newHero: newHero,
        currentHero: currentHero,
        location: dashboardData.location?.name
      });
      
      // Only update if the hero is actually different
      if (newHero !== currentHero) {
        console.log('Updating hero from', currentHero, 'to', newHero);
        setCurrentHero(newHero);
      }
    }
  }, [dashboardData?.currentWeather?.condition, timeOfDay, dashboardData?.currentWeather?.windSpeed, dashboardData?.currentWeather?.wind_kph, currentHero]);

  // Reset hero when location changes and wait for weather data
  useEffect(() => {
    if (dashboardData?.location?.name) {
      console.log('Location changed to:', dashboardData.location.name);
      // Don't reset hero immediately - let weather data determine the hero
    }
  }, [dashboardData?.location?.name]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Load saved locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      try {
        setSavedLocations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved locations:', error);
      }
    }
  }, []);

  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermissionGranted(true);
          setShowLocationPrompt(false);
        },
        (error) => {
          // Handle geolocation error
          setLocationPermissionGranted(false);
          setShowLocationPrompt(true);
        }
      );
    } else {
      // Geolocation not supported
      setLocationPermissionGranted(false);
      setShowLocationPrompt(true);
    }
  }, []);



  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchData(latitude, longitude);
            },
            async (geoError) => {
              console.warn('Geolocation error:', geoError);
              setError('Geolocation denied or unavailable. Using default location (Washington D.C.).');
              // Default to Washington D.C. coordinates
              await fetchData(38.9072, -77.0369); 
            }
          );
        } else {
          setError('Geolocation not supported by your browser. Using default location (Washington D.C.).');
          // Default to Washington D.C. coordinates
          await fetchData(38.9072, -77.0369);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to fetch initial weather data.');
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };
    
    // Only fetch data if boot loader is complete
    if (!showBootLoader) {
      fetchInitialData();
    }
  }, [showBootLoader]);

  const fetchData = async (latitude, longitude, city = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/get-weather-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: latitude,
          longitude: longitude,
          ...(city && { location: city }) // Include city as 'location' if available
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Weather data received:', data); // Debug log
      setDashboardData(data);
      
      // Safely update time and weather with null checks
      if (data && data.currentWeather) {
        console.log('Current weather data:', data.currentWeather); // Debug log
        updateTimeAndWeather(data.currentWeather.time, data.currentWeather.condition);
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeAndWeather = (time, condition) => {
    // Handle time
    if (time) {
      const hour = new Date(time).getHours();
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('dawn');
      } else if (hour >= 12 && hour < 18) {
        setTimeOfDay('day');
      } else if (hour >= 18 && hour < 21) {
        setTimeOfDay('dusk');
      } else {
        setTimeOfDay('night');
      }
    }

    // Handle condition with null check
    if (condition && typeof condition === 'string') {
      setWeatherCondition(condition.toLowerCase());
    } else {
      setWeatherCondition('clear'); // Default fallback
    }
  };

  const handleAddLocation = (locationName) => {
    if (!savedLocations.includes(locationName)) {
      setSavedLocations((prev) => [...prev, locationName]);
    }
  };

  const handleRemoveLocation = (locationName) => {
    setSavedLocations((prev) => prev.filter(loc => loc !== locationName));
  };

  const handleLoadLocation = async (locationName) => {
    setLoading(true);
    setError(null);
    setCurrentLocation(locationName);

    try {
      const geoResponse = await fetch(`/api/geocode?location=${encodeURIComponent(locationName)}`);
      if (!geoResponse.ok) {
        throw new Error(`Geocoding error! status: ${geoResponse.status}`);
      }
      const geoData = await geoResponse.json();

      if (geoData && geoData.latitude && geoData.longitude) {
        await fetchData(geoData.latitude, geoData.longitude, geoData.city);
      } else {
        setError('Location not found. Please try again or remove it.');
      }
    } catch (err) {
      console.error('Error loading location:', err);
      setError('Failed to load location. Please try again.');
    } finally {
      setLoading(false);
      setCurrentLocation('');
    }
  };

  // Handle boot loader completion
  const handleBootComplete = () => {
    setShowBootLoader(false);
  };

  // Show boot loader during initial app load
  if (showBootLoader) {
    return <JusticeLeagueBootLoader onComplete={handleBootComplete} />;
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <WatchtowerBackground
        weather={dashboardData?.currentWeather}
        location={dashboardData?.location}
        currentHero={currentHero} // Pass currentHero here
      />

      <div className="absolute inset-0 z-10 flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-between items-center bg-gray-900 bg-opacity-70">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="DC Weather App Logo" 
              className="h-10 w-auto mr-3"
            />
            <span className="text-xl font-bold text-yellow-400">Weather App</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLocationManager(!showLocationManager)}
              className="px-4 py-2 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-600 transition-colors"
            >
              {showLocationManager ? 'Hide' : 'Manage'} Locations
            </button>
            {dashboardData?.location?.name && (
              <span className="text-white text-sm">
                Current: {dashboardData.location.name}
              </span>
            )}
          </div>
        </header>

        {/* Location Manager Modal */}
        {showLocationManager && (
          <div className="absolute top-20 right-4 z-50 w-80">
            <LocationManager
              savedLocations={savedLocations}
              onAddLocation={handleAddLocation}
              onLoadLocation={handleLoadLocation}
              onRemoveLocation={handleRemoveLocation}
              currentLocation={currentLocation}
              isLoading={loading}
            />
          </div>
        )}

        <main className="flex-grow flex flex-row items-center justify-center p-4 relative">
          {/* Transparent Weather Info Block (Left) */}
          <div className="absolute left-8 top-8 bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-lg min-w-[280px] max-w-xs z-20">
            {dashboardData ? (
              <>
                <CurrentWeatherPanel
                  currentWeather={dashboardData.currentWeather}
                  location={dashboardData.location}
                />
                {dashboardData.hero && dashboardData.hero.dialogue && (
                  <div className="mt-4 p-3 bg-black/60 rounded text-yellow-300 font-mono text-sm border-l-4 border-yellow-500 shadow-inner">
                    <span className="font-bold">Batman says:</span>
                    <br />
                    <span className="italic">{dashboardData.hero.dialogue}</span>
                  </div>
                )}
                {dashboardData.dailyForecast && dashboardData.dailyForecast.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">3-Day Forecast</h3>
                    <div className="space-y-2 text-sm">
                      {dashboardData.dailyForecast.slice(0, 3).map((day, index) => (
                        <div key={index} className="border-b border-gray-600 pb-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold">{day.day}</span>
                            <span className="text-yellow-300">{day.maxTemp}°C</span>
                          </div>
                          <div className="text-xs text-gray-300">
                            <span>Min: {day.minTemp}°C</span>
                            {day.precipitation !== undefined && day.precipitation > 0 && (
                              <span className="ml-2">💧 {day.precipitation}mm</span>
                            )}
                            {day.precipitationProbability !== undefined && (
                              <span className="ml-2">☔ {day.precipitationProbability}%</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : loading ? (
              <div className="text-center text-yellow-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                <p>Loading weather data...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-400">
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <div className="text-center text-gray-300">
                <p>No weather data available</p>
              </div>
            )}
          </div>

          {/* Transparent Weather Details Block (Center-Left) */}
          <div className="absolute right-8 bottom-8 bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-lg min-w-[220px] max-w-xs z-20 flex flex-col items-center">
            {dashboardData ? (
              <>
                <div className="text-lg font-semibold mb-3 text-yellow-400">Weather Details</div>
                <div className="space-y-2 text-sm w-full">
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <span className="font-bold">{dashboardData.currentWeather.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Feels Like:</span>
                    <span className="font-bold">{dashboardData.currentWeather.feelsLike || dashboardData.currentWeather.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind Speed:</span>
                    <span className="font-bold">{dashboardData.currentWeather.wind_kph || dashboardData.currentWeather.windSpeed || 'N/A'} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Humidity:</span>
                    <span className="font-bold">{dashboardData.currentWeather.humidity || 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pressure:</span>
                    <span className="font-bold">{dashboardData.currentWeather.pressure ? Math.round(dashboardData.currentWeather.pressure) : 'N/A'} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precipitation:</span>
                    <span className="font-bold">{dashboardData.currentWeather.precipitation !== undefined ? `${dashboardData.currentWeather.precipitation} mm` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cloud Cover:</span>
                    <span className="font-bold">{dashboardData.currentWeather.cloudCover !== undefined ? `${dashboardData.currentWeather.cloudCover}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span className="font-bold capitalize">{dashboardData.currentWeather.condition || 'N/A'}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-300">
                <p className="text-sm">Weather details unavailable</p>
              </div>
            )}
          </div>

          {/* Transparent Time Block (Right) */}
          <div className="absolute right-8 top-8 bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-lg min-w-[180px] max-w-xs z-20 flex flex-col items-center">
            <div className="text-lg font-semibold mb-2">Current Time</div>
            <div className="text-2xl font-mono tracking-widest">{currentTime}</div>
          </div>
        </main>
      </div>

              {/* 3D Canvas for Heroes */}
        <div className="absolute inset-0 z-0">
          {currentHero === 'aquaman' && (
            <Aquaman3D key="aquaman" timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
          )}
          {currentHero === 'flash' && (
            <Flash3D key="flash" timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
          )}
          {(currentHero === 'batman' || !currentHero) && (
            <Batman3D key="batman" timeOfDay={timeOfDay} weatherCondition={weatherCondition} />
          )}
        </div>
    </div>
  );
}




