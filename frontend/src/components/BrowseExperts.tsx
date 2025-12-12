import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, CheckCircle, MessageCircle, Phone, Calendar, Award, Shield, Clock, Filter, X } from 'lucide-react';
import QuickQuote from './QuickQuote';
import MapView from './MapView';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import { User } from '../types';

const BrowseExperts = () => {
  const { state, dispatch } = useApp();
  const [sortBy, setSortBy] = useState('rating');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickQuote, setShowQuickQuote] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.getTradespeople({
          limit: 50,
          verified: filterBy === 'verified' ? true : undefined
        });
        
        console.log('Fetched tradespeople:', response); // Debug log
        
        // Transform User objects to match the expert structure
        const transformedExperts = (response.tradespeople || []).map((user: User) => ({
          id: user.id,
          name: user.name,
          trade: user.trades?.[0] || 'General Tradesperson',
          rating: user.rating || 0,
          reviews: user.reviews || 0,
          location: user.location || 'Location not specified',
          distance: '0 miles', // Would need geolocation to calculate
          image: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=200`,
          verified: user.verified || false,
          checkatradeMember: user.membershipType === 'premium' || user.membershipType === 'unlimited_5_year',
          specialties: user.trades || [],
          hourlyRate: '£40-60',
          responseTime: '2 hours',
          availability: 'Available this week',
          completedJobs: Math.floor(Math.random() * 200) + 50,
          description: `Professional ${user.trades?.[0] || 'tradesperson'} with years of experience.`,
          badges: user.verified ? ['Verified Professional', 'Insured'] : ['Professional'],
          lastActive: '2 hours ago'
        }));
        
        console.log('Transformed experts:', transformedExperts); // Debug log
        setExperts(transformedExperts);
      } catch (err) {
        console.error('Failed to fetch experts:', err);
        setError('Failed to load tradespeople. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [filterBy]);

  const handleQuickQuote = (tradeName: string) => {
    setSelectedTrade(tradeName);
    setShowQuickQuote(true);
  };

  const handleViewProfile = (expert: any) => {
    setSelectedExpert(expert);
    setShowProfileModal(true);
  };

  // Experts are now fetched from API in useEffect

  const sortedExperts = [...experts].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviews - a.reviews;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'price':
        return parseInt(a.hourlyRate.split('-')[0].replace('£', '')) - parseInt(b.hourlyRate.split('-')[0].replace('£', ''));
      default:
        return 0;
    }
  });

  const filteredExperts = sortedExperts.filter(expert => {
    if (filterBy === 'all') return true;
    if (filterBy === 'verified') return expert.verified;
    if (filterBy === 'checkatrade') return expert.checkatradeMember;
    if (filterBy === 'available') return expert.availability.includes('today') || expert.availability.includes('this week');
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Local Tradespeople</h1>
              <p className="text-gray-600 mt-2">{filteredExperts.length} professionals in your area</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Map View
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Highest rated</option>
                <option value="reviews">Most reviews</option>
                <option value="distance">Nearest first</option>
                <option value="price">Lowest price</option>
              </select>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setFilterBy('all')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterBy === 'all' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Professionals
              </button>
              <button
                onClick={() => setFilterBy('checkatrade')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterBy === 'checkatrade' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Premium Members
              </button>
              <button
                onClick={() => setFilterBy('available')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterBy === 'available' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Available Soon
              </button>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Trade</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Trades</option>
                  <option value="plumber">Plumbers</option>
                  <option value="electrician">Electricians</option>
                  <option value="construction">Construction/Contractors</option>
                  <option value="carpenter">Carpenters</option>
                  <option value="decorator">Decorators/Designers</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content - No paywall for homeowners anymore */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <MapView viewType="professionals" />
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-lg mb-4">
              No tradespeople found matching your criteria.
            </p>
            <button
              onClick={() => setFilterBy('all')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <div
                key={expert.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={expert.image}
                      alt={expert.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    {expert.checkatradeMember && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{expert.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{expert.trade}</p>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-gray-700 mr-2">{expert.rating}</span>
                        <span className="text-sm text-gray-500">({expert.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{expert.location} • {expert.distance}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{expert.availability}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {expert.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {expert.specialties.slice(0, 2).map((specialty: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-50 text-xs text-blue-600 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {expert.badges.slice(0, 1).map((badge: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-green-50 text-xs text-green-600 rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewProfile(expert)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => handleQuickQuote(expert.trade)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Get Quote
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 text-center">
                  Last active: {expert.lastActive}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Can't find the right professional?</p>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'submit-project' })}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Post Your Project & Get Quotes
          </button>
        </div>
      </div>

      <QuickQuote 
        isOpen={showQuickQuote}
        onClose={() => setShowQuickQuote(false)}
        tradeName={selectedTrade}
      />

      {/* Profile Modal */}
      {showProfileModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <img
                    src={selectedExpert.image}
                    alt={selectedExpert.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedExpert.name}</h2>
                    <p className="text-blue-600 font-medium text-lg">{selectedExpert.trade}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedExpert.rating} ({selectedExpert.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedExpert.completedJobs}</div>
                  <div className="text-sm text-blue-800">Jobs Completed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedExpert.hourlyRate}</div>
                  <div className="text-sm text-green-800">Hourly Rate</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedExpert.responseTime}</div>
                  <div className="text-sm text-purple-800">Response Time</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedExpert.distance}</div>
                  <div className="text-sm text-orange-800">Distance</div>
                </div>
              </div>

              {/* About */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{selectedExpert.description}</p>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExpert.specialties.map((specialty: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Qualifications */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications & Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExpert.badges.map((badge: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center"
                    >
                      <Award className="w-3 h-3 mr-1" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Reviews</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    {(() => {
                      // Sample reviews for each expert
                      const expertReviews = {
                        '1': [ // Alex Thompson
                          {
                            id: 'r1',
                            customerName: 'Sarah Johnson',
                            rating: 5,
                            comment: 'Alex did an outstanding job fixing our emergency plumbing issue. Very professional and cleaned up after himself.',
                            date: '2024-01-10',
                            projectType: 'Emergency Plumbing Repair'
                          },
                          {
                            id: 'r2',
                            customerName: 'Michael Chen',
                            rating: 5,
                            comment: 'Excellent bathroom renovation work. Alex was punctual, communicative, and delivered exactly what we wanted.',
                            date: '2024-01-05',
                            projectType: 'Bathroom Renovation'
                          },
                          {
                            id: 'r3',
                            customerName: 'Emma Wilson',
                            rating: 4,
                            comment: 'Great work on our heating system upgrade. Very knowledgeable and fair pricing.',
                            date: '2023-12-28',
                            projectType: 'Heating System Upgrade'
                          }
                        ],
                        '2': [ // Maya Patel
                          {
                            id: 'r4',
                            customerName: 'David Thompson',
                            rating: 5,
                            comment: 'Maya installed our smart home system perfectly. Very tech-savvy and explained everything clearly.',
                            date: '2024-01-08',
                            projectType: 'Smart Home Installation'
                          },
                          {
                            id: 'r5',
                            customerName: 'Lisa Rodriguez',
                            rating: 5,
                            comment: 'Professional rewiring job. Maya was efficient, clean, and very safety-conscious.',
                            date: '2024-01-02',
                            projectType: 'House Rewiring'
                          }
                        ],
                        '3': [ // James Mitchell
                          {
                            id: 'r6',
                            customerName: 'Robert Davies',
                            rating: 5,
                            comment: 'James managed our home extension project brilliantly. Great communication and quality workmanship.',
                            date: '2024-01-12',
                            projectType: 'Home Extension'
                          },
                          {
                            id: 'r7',
                            customerName: 'Amanda Foster',
                            rating: 5,
                            comment: 'Full renovation completed on time and within budget. James coordinated everything perfectly.',
                            date: '2023-12-20',
                            projectType: 'Full Home Renovation'
                          }
                        ]
                      };

                      const reviews = expertReviews[selectedExpert.id as keyof typeof expertReviews] || [];
                      
                      if (reviews.length === 0) {
                        return <p className="text-gray-500 text-center">No reviews yet</p>;
                      }

                      return reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                {review.customerName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{review.customerName}</p>
                                <p className="text-xs text-gray-500">{review.projectType}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">{review.date}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-gray-900">{selectedExpert.availability}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-gray-900">Responds in {selectedExpert.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleQuickQuote(selectedExpert.trade);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Get Quote
                </button>
                <button
                  onClick={() => alert('Contact feature coming soon!')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseExperts;