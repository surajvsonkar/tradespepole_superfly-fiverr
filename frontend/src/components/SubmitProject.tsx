import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Crosshair, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jobService } from '../services/jobService';
import { geocodingService } from '../services/geocodingService';

const SubmitProject = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    postcode: 'W1K 3DE', // Default postcode
    budget: '',
    urgency: 'Medium' as 'Low' | 'Medium' | 'High',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    latitude: null as number | null,
    longitude: null as number | null
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTrades, setFilteredTrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableTrades = [
    'Builder', 'Electrician', 'Handyman', 'Painter & Decorator', 'Plasterer',
    'Plumber', 'Roofer', 'Carpenter & Joiner', 'Landscaper', 'Bathroom Fitter',
    'Bricklayer', 'Gas Engineer', 'Carpet Fitter', 'Kitchen Fitter', 'Cabinet Maker',
    'Tiler', 'Door Fitter', 'Glazier', 'Stove Fitter', 'Window Fitter',
    'Tree Surgeon', 'Gardener', 'Locksmith', 'Architectural Designer', 'Groundworker',
    'Stonemason', 'Heating Engineer', 'Insulation Company', 'Fencer',
    'Waste & Rubbish Clearance Company', 'Demolition Company', 'Decking Installer',
    'Extension Builder', 'Security System Installer', 'Conservatory Installer',
    'Driveways Installer', 'Flooring Fitter', 'Guttering Installer',
    'Vinyl Flooring Fitter', 'Fireplace Installer', 'Architectural Technician',
    'Chimney Repair Specialist', 'Garden Maintenance Company', 'Loft Conversion Company',
    'Damp Proofer', 'Conversion Specialist', 'Garage Conversion Specialist',
    'New Home Builder', 'Repointing Specialist', 'Fascias & Soffits Installer',
    'Tarmac Driveway Company', 'Building Restoration & Refurbishment Company'
  ];

  const budgetRanges = [
    'Under £500', '£500 - £1,000', '£1,000 - £5,000', 
    '£5,000 - £10,000', '£10,000 - £25,000', 'Over £25,000'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!state.currentUser) {
      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'homeowner' } });
      return;
    }

    setLoading(true);

    try {
      await jobService.createJobLead({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        postcode: formData.postcode,
        budget: formData.budget,
        urgency: formData.urgency,
        contactDetails: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone
        },
        ...(formData.latitude && { latitude: formData.latitude }),
        ...(formData.longitude && { longitude: formData.longitude })
      });

      setSuccess(true);
      setFormData({
        title: '', description: '', category: '', location: '', postcode: 'W1K 3DE', budget: '',
        urgency: 'Medium', contactName: '', contactEmail: '', contactPhone: '',
        latitude: null, longitude: null
      });

      setTimeout(() => {
        dispatch({ type: 'SET_VIEW', payload: 'profile' });
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create job:', err);
      setError(err.message || 'Failed to submit project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
    if (value.length > 0) {
      const filtered = availableTrades.filter(trade =>
        trade.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTrades(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectTrade = (trade: string) => {
    setFormData({ ...formData, category: trade });
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);

    try {
      // Get current position
      const position = await geocodingService.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      const result = await geocodingService.reverseGeocode(latitude, longitude);

      if (result) {
        // Format a user-friendly location string
        const locationParts: string[] = [];
        if (result.city) locationParts.push(result.city);
        if (result.country) locationParts.push(result.country);
        
        const locationString = locationParts.length > 0 
          ? locationParts.join(', ')
          : result.displayName.split(',').slice(0, 3).join(',').trim();

        setFormData(prev => ({
          ...prev,
          location: locationString,
          latitude,
          longitude
        }));
      } else {
        // If reverse geocoding fails, still save coordinates
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setError('Could not determine address. Coordinates saved.');
      }
    } catch (err: any) {
      console.error('Location error:', err);
      if (err.code === 1) {
        setError('Location access denied. Please enable location permissions in your browser settings.');
      } else if (err.code === 2) {
        setError('Location unavailable. Please try again or enter your location manually.');
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again.');
      } else {
        setError('Could not get your location. Please enter it manually.');
      }
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Project</h1>
          <p className="text-gray-600 mt-2">Tell us about your project and connect with qualified professionals</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            Project submitted successfully! Redirecting...
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Kitchen Renovation, Bathroom Plumbing Fix"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade/Category
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    onFocus={() => {
                      if (formData.category.length > 0) {
                        const filtered = availableTrades.filter(trade =>
                          trade.toLowerCase().includes(formData.category.toLowerCase())
                        );
                        setFilteredTrades(filtered);
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start typing a trade (e.g., Plumber, Electrician...)"
                    required
                  />
                  {showSuggestions && filteredTrades.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                      {filteredTrades.map((trade, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectTrade(trade)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {trade}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Select from List
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a trade</option>
                  {availableTrades.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value, latitude: null, longitude: null })}
                    className="w-full pl-10 pr-32 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your location"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locationLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Getting...</span>
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-4 h-4" />
                        <span>Use Current</span>
                      </>
                    )}
                  </button>
                </div>
                {formData.latitude && formData.longitude && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Coordinates saved: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                    className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., W1K 3DE"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your postcode - tradespeople will be alerted based on this location
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as 'Low' | 'Medium' | 'High' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low - Flexible timing</option>
                  <option value="Medium">Medium - Within a few weeks</option>
                  <option value="High">High - ASAP</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                  required
                />
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your email"
                  required
                />
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your phone"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitProject;