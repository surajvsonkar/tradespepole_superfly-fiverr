import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngExpression, divIcon } from 'leaflet';
import { MapPin, Star, Heart, CreditCard, X, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Filter, Users, Briefcase, Target, Search, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Interest, JobLead, User } from '../types';
import { jobService } from '../services/jobService';
import { userService } from '../services/userService';
import { geocodingService } from '../services/geocodingService';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet - use CSS-based icons instead
const createMarkerIcon = (color: string, type: 'professional' | 'job' | 'user') => {
  const iconHtml = type === 'professional' 
    ? `<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="transform: rotate(45deg);">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>`
    : type === 'job'
    ? `<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style="transform: rotate(45deg);">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
        </svg>
      </div>`
    : `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
      </div>`;
  
  return divIcon({
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
    className: 'custom-marker-icon'
  });
};

interface MapViewProps {
  viewType: 'professionals' | 'jobs';
}

interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'professional' | 'job';
  data: any;
}

// Custom map control component
const MapControls = ({ onZoomIn, onZoomOut, onResetView, onGetLocation }: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onGetLocation: () => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const handleZoomIn = () => map.zoomIn();
    const handleZoomOut = () => map.zoomOut();
    const handleResetView = () => map.setView([51.5074, -0.1278], 12);

    onZoomIn = handleZoomIn;
    onZoomOut = handleZoomOut;
    onResetView = handleResetView;
  }, [map]);

  return null;
};

const MapView = ({ viewType }: MapViewProps) => {
  const { state, dispatch } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([51.5074, -0.1278]); // London center
  const [zoom, setZoom] = useState(12);
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    rating: '',
    distance: '',
    radius: 25, // Default 25 miles radius
    verified: false
  });
  const [jobLeads, setJobLeads] = useState<JobLead[]>([]);
  const [tradespeople, setTradespeople] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [geocodedLocations, setGeocodedLocations] = useState<Map<string, { lat: number; lng: number }>>(new Map());

  // Geocode locations and fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (viewType === 'jobs') {
          const response = await jobService.getJobLeads();
          const jobs = response.jobLeads || [];
          
          // Geocode job locations
          const geocoded = new Map<string, { lat: number; lng: number }>();
          for (const job of jobs) {
            if (job.location && !geocoded.has(job.location)) {
              // Try to use existing coordinates if available
              if (job.latitude && job.longitude) {
                geocoded.set(job.location, { lat: Number(job.latitude), lng: Number(job.longitude) });
              } else {
                // Geocode the location
                const result = await geocodingService.geocodeAddress(job.location);
                if (result) {
                  geocoded.set(job.location, { lat: result.lat, lng: result.lng });
                } else {
                  // Use mock coordinates as fallback
                  geocoded.set(job.location, geocodingService.getMockCoordinates(job.location));
                }
              }
            }
          }
          
          setGeocodedLocations(geocoded);
          setJobLeads(jobs);
        } else {
          const response = await userService.getTradespeople();
          const people = response.tradespeople || [];
          
          // Geocode tradesperson locations
          const geocoded = new Map<string, { lat: number; lng: number }>();
          for (const person of people) {
            if (person.location && !geocoded.has(person.location)) {
              // Try to use existing coordinates if available
              if (person.latitude && person.longitude) {
                geocoded.set(person.location, { lat: Number(person.latitude), lng: Number(person.longitude) });
              } else {
                // Geocode the location
                const result = await geocodingService.geocodeAddress(person.location);
                if (result) {
                  geocoded.set(person.location, { lat: result.lat, lng: result.lng });
                } else {
                  // Use mock coordinates as fallback
                  geocoded.set(person.location, geocodingService.getMockCoordinates(person.location));
                }
              }
            }
          }
          
          setGeocodedLocations(geocoded);
          setTradespeople(people);
        }
      } catch (err) {
        console.error('Failed to fetch map data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewType]);

  // Handle location search
  const handleLocationSearch = useCallback(async () => {
    if (!searchLocation.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await geocodingService.geocodeAddress(searchLocation);
      if (result) {
        setSearchCenter({ lat: result.lat, lng: result.lng });
        setMapCenter([result.lat, result.lng]);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [searchLocation]);

  // Calculate pricing based on membership
  const calculateLeadPrice = (membershipType: string = 'none') => {
    const basePrice = 9.99;

    let discount = 0;
    let finalPrice = basePrice;

    switch (membershipType) {
      case 'basic':
        discount = 0.1; // 10% discount
        finalPrice = basePrice * (1 - discount);
        break;
      case 'premium':
        discount = 0.25; // 25% discount
        finalPrice = basePrice * (1 - discount);
        break;
      case 'unlimited_5_year':
        discount = 1; // 100% discount (free)
        finalPrice = 0;
        break;
      default:
        discount = 0;
        finalPrice = basePrice;
    }

    return {
      basePrice,
      discount: discount * 100,
      finalPrice,
      membershipType
    };
  };

  const calculateInterestPrice = (membershipType: string = 'none') => {
    const basePrice = 5.99;

    let discount = 0;
    let finalPrice = basePrice;

    switch (membershipType) {
      case 'basic':
        discount = 0.1; // 10% discount
        finalPrice = basePrice * (1 - discount);
        break;
      case 'premium':
        discount = 0.25; // 25% discount
        finalPrice = basePrice * (1 - discount);
        break;
      case 'unlimited_5_year':
        discount = 1; // 100% discount (free)
        finalPrice = 0;
        break;
      default:
        discount = 0;
        finalPrice = basePrice;
    }

    return {
      basePrice,
      discount: discount * 100,
      finalPrice,
      membershipType
    };
  };

  // Convert API data to map locations with geocoding
  const getMapLocations = (): MapLocation[] => {
    const referencePoint = searchCenter || (userLocation ? { lat: (userLocation as [number, number])[0], lng: (userLocation as [number, number])[1] } : null);
    
    if (viewType === 'jobs') {
      return jobLeads
        .filter(job => job.isActive)
        .map(job => {
          // Get geocoded coordinates
          const coords = geocodedLocations.get(job.location) || geocodingService.getMockCoordinates(job.location);
          
          // Calculate distance if we have a reference point
          let distance = '-- miles';
          if (referencePoint) {
            const dist = geocodingService.calculateDistance(
              referencePoint.lat, 
              referencePoint.lng, 
              coords.lat, 
              coords.lng
            );
            distance = `${dist.distanceMiles.toFixed(1)} miles`;
          }
          
          return {
            id: job.id,
            lat: coords.lat,
            lng: coords.lng,
            title: job.title,
            type: 'job' as const,
            data: {
              title: job.title,
              category: job.category,
              budget: job.budget,
              urgency: job.urgency,
              postedDate: job.postedDate || 'Recently',
              description: job.description,
              contactName: job.contactDetails?.name || 'Homeowner',
              id: job.id,
              location: job.location,
              distance
            }
          };
        });
    } else {
      return tradespeople
        .filter(person => person.type === 'tradesperson')
        .map(person => {
          // Get geocoded coordinates
          const coords = geocodedLocations.get(person.location || '') || geocodingService.getMockCoordinates(person.location || 'London');
          
          // Calculate distance if we have a reference point
          let distance = '-- miles';
          if (referencePoint) {
            const dist = geocodingService.calculateDistance(
              referencePoint.lat, 
              referencePoint.lng, 
              coords.lat, 
              coords.lng
            );
            distance = `${dist.distanceMiles.toFixed(1)} miles`;
          }
          
          return {
            id: person.id,
            lat: coords.lat,
            lng: coords.lng,
            title: `${person.name} - ${person.trades?.[0] || 'Professional'}`,
            type: 'professional' as const,
            data: {
              name: person.name,
              trade: person.trades?.[0] || 'Professional',
              rating: person.rating || 0,
              reviews: person.reviews || 0,
              verified: person.verified || false,
              distance,
              responseTime: '2 hours',
              hourlyRate: '£40-60',
              image: person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=2563eb&color=fff&size=200`,
              id: person.id,
              location: person.location
            }
          };
        });
    }
  };

  const mapLocations = getMapLocations();

  const filteredLocations = mapLocations.filter(location => {
    if (location.type !== viewType.slice(0, -1)) return false;
    
    // Category filter
    if (filters.category !== 'all') {
      if (location.type === 'professional' && !location.data.trade.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }
      if (location.type === 'job' && location.data.category !== filters.category) {
        return false;
      }
    }
    
    // Verified filter
    if (filters.verified && location.type === 'professional' && !location.data.verified) {
      return false;
    }
    
    // Radius filter - only apply if we have a search center or user location
    const referencePoint = searchCenter || (userLocation ? { lat: (userLocation as [number, number])[0], lng: (userLocation as [number, number])[1] } : null);
    if (referencePoint && filters.radius > 0) {
      const isWithin = geocodingService.isWithinRadius(
        referencePoint.lat,
        referencePoint.lng,
        location.lat,
        location.lng,
        filters.radius
      );
      if (!isWithin) return false;
    }
    
    // Rating filter for professionals
    if (filters.rating && location.type === 'professional') {
      const minRating = parseFloat(filters.rating);
      if (location.data.rating < minRating) return false;
    }
    
    return true;
  });

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LatLngExpression = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log('Error getting location:', error);
          alert('Unable to get your current location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleViewJobDetails = (jobData: any) => {
    setSelectedJob(jobData);
    setShowJobDetails(true);
  };

  const handlePurchaseJobLead = () => {
    if (!state.currentUser) {
      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'tradesperson' } });
      return;
    }

    if (state.currentUser.type !== 'tradesperson') {
      alert('Only tradespeople can purchase leads');
      return;
    }

    const pricing = calculateLeadPrice(state.currentUser.membershipType);

    if (pricing.finalPrice > 0 && (!state.currentUser.credits || state.currentUser.credits < pricing.finalPrice)) {
      alert(`Insufficient credits. You need £${pricing.finalPrice.toFixed(2)} to purchase this lead.`);
      return;
    }

    // Find the actual job lead in state (this is a mock, in real app you'd have the actual job ID)
    const jobLead = jobLeads.find(lead => lead.title === selectedJob.title);
    if (jobLead) {
      dispatch({ type: 'PURCHASE_LEAD', payload: { leadId: jobLead.id, tradespersonId: state.currentUser.id, price: pricing.finalPrice } });
      
      // Force a small delay to ensure state updates, then show confirmation
      setTimeout(() => {
      if (pricing.finalPrice === 0) {
          alert('Lead purchased successfully with your VIP membership! No credits deducted. Contact details are now available.');
      } else {
          alert(`Lead purchased successfully! £${pricing.finalPrice.toFixed(2)} has been deducted from your credits. Contact details are now available.`);
      }
      setShowJobDetails(false);
      }, 100);
    } else {
      alert('This is a demo job. In the real app, you would purchase this lead.');
      setShowJobDetails(false);
    }
  };

  const handleExpressInterest = () => {
    if (!state.currentUser) {
      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'tradesperson' } });
      return;
    }

    if (state.currentUser.type !== 'tradesperson') {
      alert('Only tradespeople can express interest');
      return;
    }

    setShowInterestModal(true);
  };

  const submitInterest = () => {
    if (!selectedJob || !state.currentUser || !interestMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    const pricing = calculateInterestPrice(state.currentUser.membershipType);

    // Find the actual job lead in state
    const jobLead = jobLeads.find(lead => lead.title === selectedJob.title);
    if (jobLead) {
      const interest: Interest = {
        id: `int_${Date.now()}`,
        tradespersonId: state.currentUser.id,
        tradespersonName: state.currentUser.name,
        message: interestMessage,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        price: pricing.finalPrice
      };

      dispatch({ type: 'EXPRESS_INTEREST', payload: { leadId: jobLead.id, tradespersonId: state.currentUser.id, message: interestMessage, price: pricing.finalPrice } });
      
      if (pricing.finalPrice === 0) {
        alert('Interest expressed successfully with your VIP membership! No charge if accepted.');
      } else {
        alert(`Interest expressed successfully! You will be charged £${pricing.finalPrice.toFixed(2)} if the homeowner accepts.`);
      }
    } else {
      alert('This is a demo job. In the real app, you would express interest in this lead.');
    }

    setShowInterestModal(false);
    setShowJobDetails(false);
    setInterestMessage('');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'High': return <AlertTriangle className="w-4 h-4" />;
      case 'Medium': return <Clock className="w-4 h-4" />;
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Create custom icons for different marker types
  const getMarkerColor = (location: MapLocation) => {
    if (location.type === 'professional') {
      return '#3B82F6';
    } else {
      switch (location.data.urgency) {
        case 'High': return '#EF4444';
        case 'Medium': return '#F59E0B';
        case 'Low': return '#10B981';
        default: return '#6B7280';
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Map Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {viewType === 'professionals' ? 'Local Professionals' : 'Available Jobs'}
            </h2>
            <div className="flex items-center text-sm text-gray-600">
              {viewType === 'professionals' ? (
                <>
                  <Users className="w-4 h-4 mr-1" />
                  {filteredLocations.length} professionals
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-1" />
                  {filteredLocations.length} jobs
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Location Search */}
            <div className="flex">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                placeholder="Search location..."
                className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-40"
              />
              <button
                onClick={handleLocationSearch}
                disabled={isSearching}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={getUserLocation}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4 mr-2" />
              My Location
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category / Trade</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="builder">Builder</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="painter">Painter & Decorator</option>
                  <option value="roofer">Roofer</option>
                  <option value="landscaper">Landscaper</option>
                  <option value="handyman">Handyman</option>
                </select>
              </div>
              
              {/* Radius Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius: {filters.radius} miles
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={filters.radius}
                  onChange={(e) => setFilters({...filters, radius: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 mi</span>
                  <span>50 mi</span>
                  <span>100 mi</span>
                </div>
              </div>
              
              {viewType === 'professionals' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters({...filters, rating: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any rating</option>
                      <option value="4.5">4.5+ stars</option>
                      <option value="4.0">4.0+ stars</option>
                      <option value="3.5">3.5+ stars</option>
                      <option value="3.0">3.0+ stars</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters({...filters, verified: e.target.checked})}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Verified only</span>
                    </label>
                  </div>
                </>
              )}
            </div>
            
            {/* Active filters indicator */}
            {(searchCenter || userLocation) && (
              <div className="mt-3 flex items-center text-sm text-blue-600">
                <Target className="w-4 h-4 mr-1" />
                Showing results within {filters.radius} miles of {searchCenter ? 'searched location' : 'your location'}
                <button
                  onClick={() => {
                    setSearchCenter(null);
                    setSearchLocation('');
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Container */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapControls
            onZoomIn={() => {}}
            onZoomOut={() => {}}
            onResetView={() => {}}
            onGetLocation={getUserLocation}
          />

          {/* Location Markers */}
          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createMarkerIcon(getMarkerColor(location), location.type)}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[250px]">
                  <h3 className="font-semibold text-gray-900 mb-2">{location.title}</h3>
                  
                  {location.type === 'professional' ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <img
                          src={location.data.image}
                          alt={location.data.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{location.data.name}</p>
                          <p className="text-sm text-blue-600">{location.data.trade}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Rating:</span>
                          <span className="ml-1 font-medium">{location.data.rating} ⭐</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reviews:</span>
                          <span className="ml-1 font-medium">{location.data.reviews}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Distance:</span>
                          <span className="ml-1 font-medium">{location.data.distance}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Response:</span>
                          <span className="ml-1 font-medium">{location.data.responseTime}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-bold text-green-600">{location.data.hourlyRate}/hr</span>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Contact Professional
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-1 font-medium">{location.data.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Budget:</span>
                          <span className="ml-1 font-medium">{location.data.budget}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Priority:</span>
                          <span className={`ml-1 font-medium ${
                            location.data.urgency === 'High' ? 'text-red-600' :
                            location.data.urgency === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {location.data.urgency}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Posted:</span>
                          <span className="ml-1 font-medium">{location.data.postedDate}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{location.data.description}</p>
                      <div className="text-sm">
                        <span className="text-gray-600">Contact:</span>
                        <span className="ml-1 font-medium">{location.data.contactName}</span>
                      </div>
                      <button 
                        onClick={() => handleViewJobDetails(location.data)}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        View Job Details
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Location Marker */}
          {userLocation && (
            <Marker 
              position={userLocation}
              icon={createMarkerIcon('#2563EB', 'user')}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-medium">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Search Radius Circle */}
          {searchCenter && (
            <Circle
              center={[searchCenter.lat, searchCenter.lng]}
              radius={filters.radius * 1609.34} // Convert miles to meters
              pathOptions={{
                color: '#10B981',
                fillColor: '#10B981',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '10, 5'
              }}
            />
          )}

          {/* User Location Radius Circle */}
          {userLocation && !searchCenter && (
            <Circle
              center={userLocation}
              radius={filters.radius * 1609.34} // Convert miles to meters
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '10, 5'
              }}
            />
          )}

          {/* Working Area Circle (if user has one set) */}
          {state.currentUser?.workingArea && state.currentUser.workingArea.coordinates && (
            <Circle
              center={[
                state.currentUser.workingArea.coordinates.lat,
                state.currentUser.workingArea.coordinates.lng
              ]}
              radius={state.currentUser.workingArea.radius * 1609.34} // Convert miles to meters
              pathOptions={{
                color: '#8B5CF6',
                fillColor: '#8B5CF6',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
          )}
        </MapContainer>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[1000]">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Map Legend</h4>
          <div className="space-y-1">
            {viewType === 'professionals' ? (
              <>
                <div className="flex items-center text-xs text-gray-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Professional
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center text-xs text-gray-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  High Priority
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  Medium Priority
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Low Priority
                </div>
              </>
            )}
            {userLocation && (
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                Your Location
              </div>
            )}
            {state.currentUser?.workingArea && (
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-3 h-1 bg-blue-500 border-dashed border mr-2"></div>
                Working Area
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Briefcase className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
                </div>
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Job Information */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getUrgencyColor(selectedJob.urgency)}`}>
                      {getUrgencyIcon(selectedJob.urgency)}
                      <span className="ml-1">{selectedJob.urgency} Priority</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Project Description</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-blue-900">Location</span>
                    </div>
                    <p className="text-blue-800">{selectedJob.location || 'Location not specified'}</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-900">Budget</span>
                    </div>
                    <p className="text-green-800">{selectedJob.budget || 'Budget not specified'}</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Briefcase className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-semibold text-purple-900">Category</span>
                    </div>
                    <p className="text-purple-800">{selectedJob.category || 'Category not specified'}</p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="font-semibold text-orange-900">Posted</span>
                    </div>
                    <p className="text-orange-800">{selectedJob.postedDate || 'Date not specified'}</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Contact:</span> {selectedJob.contactName || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      To view full contact details, you'll need to purchase this job lead or express interest.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  {/* Pricing Information */}
                  {state.currentUser?.type === 'tradesperson' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">💰 Pricing</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-700">
                            <strong>Purchase Lead:</strong>
                          </p>
                          {state.currentUser.membershipType === 'unlimited_5_year' ? (
                            <p className="text-green-600 font-bold">FREE with VIP!</p>
                          ) : (
                            <p className="text-blue-800">
                              £{calculateLeadPrice(state.currentUser.membershipType).finalPrice.toFixed(2)}
                              {state.currentUser.membershipType && state.currentUser.membershipType !== 'none' && (
                                <span className="text-green-600 ml-1">
                                  (Save {calculateLeadPrice(state.currentUser.membershipType).discount}%)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-blue-700">
                            <strong>Express Interest:</strong>
                          </p>
                          {state.currentUser.membershipType === 'unlimited_5_year' ? (
                            <p className="text-green-600 font-bold">FREE with VIP!</p>
                          ) : (
                            <p className="text-blue-800">
                              £{calculateInterestPrice(state.currentUser.membershipType).finalPrice.toFixed(2)} if accepted
                              {state.currentUser.membershipType && state.currentUser.membershipType !== 'none' && (
                                <span className="text-green-600 ml-1">
                                  (Save {calculateInterestPrice(state.currentUser.membershipType).discount}%)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      {state.currentUser.credits !== undefined && (
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Your Credits:</strong> £{state.currentUser.credits ? Number(state.currentUser.credits).toFixed(2) : '0.00'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {state.currentUser?.type === 'tradesperson' ? (
                      <>
                        {state.currentUser.membershipType === 'unlimited_5_year' ? (
                          <button
                            onClick={handlePurchaseJobLead}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold flex items-center justify-center"
                          >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Purchase Lead - VIP FREE
                          </button>
                        ) : (
                          <button
                            onClick={handlePurchaseJobLead}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                          >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Purchase Lead £{calculateLeadPrice(state.currentUser.membershipType).finalPrice.toFixed(2)}
                          </button>
                        )}
                        
                        {state.currentUser.membershipType === 'unlimited_5_year' ? (
                          <button
                            onClick={handleExpressInterest}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors font-semibold flex items-center justify-center"
                          >
                            <Heart className="w-5 h-5 mr-2" />
                            Express Interest - VIP FREE
                          </button>
                        ) : (
                          <button
                            onClick={handleExpressInterest}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center"
                          >
                            <Heart className="w-5 h-5 mr-2" />
                            Express Interest
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'tradesperson' } })}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Sign Up as Tradesperson to Purchase
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2001] p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Express Interest</h3>
            
            {state.currentUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Interest Expression Fee:</p>
                  <div className="text-blue-700">
                    {state.currentUser.membershipType === 'unlimited_5_year' ? (
                      <p className="font-bold text-lg text-green-600">
                        FREE with your VIP membership!
                      </p>
                    ) : (
                      <p className="font-bold text-lg">
                        £{calculateInterestPrice(state.currentUser.membershipType).finalPrice.toFixed(2)} if accepted
                        {state.currentUser.membershipType && state.currentUser.membershipType !== 'none' && (
                          <span className="text-green-600 text-sm ml-1">
                            (Save {calculateInterestPrice(state.currentUser.membershipType).discount}%)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-4">
              Send a message to the homeowner explaining why you're the right person for this job.
            </p>
            
            <textarea
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              placeholder="Tell the homeowner why you're the right person for this job..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowInterestModal(false);
                  setInterestMessage('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitInterest}
                className={`px-4 py-2 rounded-lg font-medium ${
                  state.currentUser?.membershipType === 'unlimited_5_year'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={!interestMessage.trim()}
              >
                {state.currentUser?.membershipType === 'unlimited_5_year' 
                  ? 'Send Interest - VIP FREE' 
                  : 'Send Interest'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;