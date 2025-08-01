'use client';
import { useState, useEffect } from 'react';

const LocationManager = ({ 
  savedLocations, 
  onAddLocation, 
  onLoadLocation, 
  onRemoveLocation,
  currentLocation,
  isLoading 
}) => {
  const [newLocationInput, setNewLocationInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLocation = async () => {
    if (!newLocationInput.trim()) return;
    
    setIsAdding(true);
    try {
      // Test if location exists by geocoding it
      const response = await fetch(`/api/geocode?location=${encodeURIComponent(newLocationInput.trim())}`);
      const data = await response.json();
      
      if (data.error) {
        alert('Location not found. Please check the spelling and try again.');
        return;
      }
      
      // Add to saved locations
      onAddLocation(newLocationInput.trim());
      setNewLocationInput('');
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Error adding location. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddLocation();
    }
  };

  return (
    <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-yellow-400 mb-4">Location Manager</h3>
      
      {/* Add New Location */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter city name (e.g., London, Tokyo)"
            className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
            value={newLocationInput}
            onChange={(e) => setNewLocationInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isAdding}
          />
          <button
            onClick={handleAddLocation}
            disabled={isAdding || !newLocationInput.trim()}
            className="px-4 py-2 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Saved Locations */}
      {savedLocations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Saved Locations:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <span className="text-white text-sm">{location}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoadLocation(location)}
                    disabled={isLoading}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading && currentLocation === location ? 'Loading...' : 'Load'}
                  </button>
                  <button
                    onClick={() => onRemoveLocation(location)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedLocations.length === 0 && (
        <p className="text-gray-400 text-sm italic">No saved locations yet. Add a city above to get started.</p>
      )}
    </div>
  );
};

export default LocationManager; 