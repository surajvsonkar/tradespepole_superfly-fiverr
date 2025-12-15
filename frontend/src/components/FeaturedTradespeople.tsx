import React, { useEffect, useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import { User } from '../types';

const FeaturedTradespeople = () => {
  const { state, dispatch } = useApp();
  const [tradespeople, setTradespeople] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTradespeople = async () => {
      try {
        const response = await userService.getTradespeople({
          limit: 4,
          verified: true,
          minRating: 4.5
        });
        setTradespeople(response.tradespeople || []);
      } catch (err) {
        console.error('Failed to fetch featured tradespeople:', err);
        setError('Failed to load featured professionals');
      } finally {
        setLoading(false);
      }
    };

    fetchTradespeople();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top-Rated Professionals</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || tradespeople.length === 0) {
    // Fallback UI or empty state if API fails or returns no data
    return null; 
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Top-Rated Professionals
          </h2>
          <p className="text-lg text-gray-600">
            Exceptional craftspeople with proven track records
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tradespeople.map((person) => (
            <div
              key={person.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`}
                    alt={person.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  {person.verified && (
                    <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {person.name}
                </h3>
                <p className="text-blue-600 font-medium mb-2">
                  {person.trades && person.trades.length > 0 ? person.trades[0] : 'Professional'}
                </p>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {person.rating ? Number(person.rating).toFixed(1) : 'New'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({person.reviews || 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {person.location || 'Location not specified'}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4 justify-center">
                  {person.trades?.slice(0, 2).map((specialty, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    if (!state.currentUser) {
                      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'login', userType: 'homeowner' } });
                      return;
                    }
                    dispatch({ type: 'SET_VIEW', payload: 'browse-experts' });
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  See Portfolio
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTradespeople;