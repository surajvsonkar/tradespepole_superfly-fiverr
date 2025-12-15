import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, Filter, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Hero = () => {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rating: '',
    distance: '',
    availability: '',
    verified: false
  });

  const handleGetStarted = () => {
    if (!state.currentUser) {
      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'homeowner' } });
      return;
    }
    dispatch({ type: 'SET_VIEW', payload: 'submit-project' });
  };

  const handleSearch = () => {
    if (!state.currentUser) {
      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'login', userType: 'homeowner' } });
      return;
    }
    if (searchQuery || location) {
      dispatch({ type: 'SET_VIEW', payload: 'browse-experts' });
    } else {
      handleGetStarted();
    }
  };

  const popularServices = [
    { name: 'Plumbing', count: '1,850+ pros' },
    { name: 'Electrician', count: '1,420+ pros' },
    { name: 'Construction', count: '2,680+ pros' },
    { name: 'Carpentry', count: '1,760+ pros' },
    { name: 'Decorating', count: '1,290+ pros' }
  ];

  return (
    <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Trusted Local
            <span className="text-blue-600 block">Tradespeople</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with reviewed professionals in your area. Get quotes, compare prices, and book with confidence.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="relative lg:col-span-6">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What do you need help with?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative lg:col-span-4">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your postcode or area"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="lg:col-span-2 flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 border rounded-lg transition-colors ${
                      showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSearch}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="border-t pt-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                    <select
                      value={filters.distance}
                      onChange={(e) => setFilters({...filters, distance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any distance</option>
                      <option value="5">Within 5 miles</option>
                      <option value="10">Within 10 miles</option>
                      <option value="25">Within 25 miles</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      value={filters.availability}
                      onChange={(e) => setFilters({...filters, availability: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any time</option>
                      <option value="today">Available today</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <span className="text-sm text-gray-600">Popular services:</span>
              {popularServices.map((service, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    if (!state.currentUser) {
                      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'login', userType: 'homeowner' } });
                      return;
                    }
                    dispatch({ 
                      type: 'SET_VIEW_WITH_FILTER', 
                      payload: { view: 'browse-experts', filter: service.filter }
                    });
                  }}
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  {service.name}
                  <span className="ml-1 text-xs text-gray-500">({service.count})</span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>5,000+ professionals</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span>4.8 average rating</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>18,000+ completed projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;