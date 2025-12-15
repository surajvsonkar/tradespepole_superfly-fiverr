import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import { LatLngExpression, divIcon } from 'leaflet';
import { MapPin, Navigation, Save, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Create a simple marker icon for the working area selector
const createSimpleMarkerIcon = () => {
  const iconHtml = `<div style="
    background-color: #3B82F6;
    width: 20px;
    height: 20px;
    border-radius: 50% 50% 50% 0;
    border: 2px solid white;
    transform: rotate(-45deg);
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`;
  
  return divIcon({
    html: iconHtml,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20],
    className: 'simple-marker-icon'
  });
};

interface WorkingAreaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workingArea: WorkingAreaData) => void;
  currentWorkingArea?: WorkingAreaData;
}

export interface WorkingAreaData {
  centerLocation: string;
  radius: number;
  coordinates?: { lat: number; lng: number };
}

// Component to update map view when location changes
const MapUpdater = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const WorkingAreaSelector = ({ isOpen, onClose, onSave, currentWorkingArea }: WorkingAreaSelectorProps) => {
  const [workingArea, setWorkingArea] = useState<WorkingAreaData>(
    currentWorkingArea || {
      centerLocation: 'W1K 3DE', // Default postcode
      radius: 15 // Default 15 miles job radius
    }
  );
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([51.5074, -0.1278]); // London center

  if (!isOpen) return null;

  const radiusOptions = [
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 15, label: '15 miles' },
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
    { value: 75, label: '75 miles' },
    { value: 100, label: '100 miles' },
    { value: 150, label: '150 miles' },
    { value: 200, label: '200 miles' }
  ];

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCenter: LatLngExpression = [latitude, longitude];
          setWorkingArea(prev => ({
            ...prev,
            centerLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { lat: latitude, lng: longitude }
          }));
          setMapCenter(newCenter);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          alert('Unable to get your current location. Please enter your location manually.');
        }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSave = () => {
    if (!workingArea.centerLocation.trim()) {
      alert('Please enter your center location');
      return;
    }
    onSave(workingArea);
    onClose();
  };

  const getCoverageArea = (radius: number) => {
    const areas = {
      5: 'Local area only',
      10: 'Town/City coverage',
      15: 'Extended local area',
      25: 'Regional coverage',
      50: 'County-wide coverage',
      75: 'Multi-county area',
      100: 'Large regional area',
      150: 'Multi-regional coverage',
      200: 'National coverage'
    };
    return areas[radius as keyof typeof areas] || 'Custom coverage';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MapPin className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Set Your Working Area</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Center Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Center Location
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={workingArea.centerLocation}
                  onChange={(e) => setWorkingArea(prev => ({ ...prev, centerLocation: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter postcode, city, or address"
                />
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  {isLocating ? 'Locating...' : 'Use Current'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This will be the center point of your working area
              </p>
            </div>

            {/* Radius Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Radius
              </label>
              <div className="grid grid-cols-3 gap-3">
                {radiusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setWorkingArea(prev => ({ ...prev, radius: option.value }))}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      workingArea.radius === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getCoverageArea(option.value)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Coverage Preview</h3>
              <div className="text-sm text-blue-700">
                <p><strong>Center:</strong> {workingArea.centerLocation || 'Not set'}</p>
                <p><strong>Radius:</strong> {workingArea.radius} miles</p>
                <p><strong>Coverage:</strong> {getCoverageArea(workingArea.radius)}</p>
                <p className="mt-2 text-xs">
                  You'll receive job notifications and be visible to customers within this area.
                </p>
              </div>
            </div>

            {/* Visual Map Preview */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <div className="h-64 relative">
                <MapContainer
                  center={mapCenter}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapUpdater center={mapCenter} zoom={10} />
                  
                  {/* Center point marker */}
                  {workingArea.coordinates && (
                    <Marker 
                      position={[workingArea.coordinates.lat, workingArea.coordinates.lng]}
                      icon={createSimpleMarkerIcon()}
                    />
                  )}
                  
                  {/* Working area circle */}
                  {workingArea.coordinates && (
                    <Circle
                      center={[workingArea.coordinates.lat, workingArea.coordinates.lng]}
                      radius={workingArea.radius * 1609.34} // Convert miles to meters
                      pathOptions={{
                        color: '#3B82F6',
                        fillColor: '#3B82F6',
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: '5, 5'
                      }}
                    />
                  )}
                </MapContainer>
                
                <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded shadow text-xs text-gray-600">
                  {workingArea.radius} mile radius
                </div>
              </div>
              <p className="text-sm text-gray-600 p-2 text-center">
                Interactive map showing your working area coverage
              </p>
            </div>

            {/* Pricing Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">💰 Pricing Impact</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Larger areas:</strong> More job opportunities, higher competition</p>
                <p><strong>Smaller areas:</strong> Fewer jobs, less competition, faster response times</p>
                <p><strong>Recommendation:</strong> Start with 25-50 miles and adjust based on demand</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Working Area
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingAreaSelector;