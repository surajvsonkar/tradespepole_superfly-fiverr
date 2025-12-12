import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, MessageCircle, CreditCard, CheckCircle, Clock, AlertTriangle, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuoteRequest as QuoteRequestType, QuoteResponse } from '../types';
import { quoteService } from '../services/quoteService';
import { ChatModal as MessagingModal } from './MessagingModal';

const QuoteRequest = () => {
  const { state, dispatch } = useApp();
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    quotedPrice: '',
    description: '',
    timeline: ''
  });
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch quote requests from API
  useEffect(() => {
    const fetchQuotes = async () => {
      if (!state.currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await quoteService.getQuoteRequests();
        setQuoteRequests(response.quoteRequests || []);
      } catch (err) {
        console.error('Failed to fetch quote requests:', err);
        setError('Failed to load quote requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [state.currentUser]);

  // Calculate pricing based on membership
  const calculateQuotePrice = (membershipType: string = 'none') => {
    const basePrice = 5.99;
    const vat = basePrice * 0.2; // 20% VAT
    const totalWithVat = basePrice + vat;

    let discount = 0;
    let finalPrice = totalWithVat;

    switch (membershipType) {
      case 'basic':
        discount = 0.1; // 10% discount
        finalPrice = totalWithVat * (1 - discount);
        break;
      case 'premium':
        discount = 0.25; // 25% discount
        finalPrice = totalWithVat * (1 - discount);
        break;
      case 'lifetime':
        discount = 1; // 100% discount (free)
        finalPrice = 0;
        break;
      default:
        discount = 0;
        finalPrice = totalWithVat;
    }

    return {
      basePrice,
      vat,
      totalWithVat,
      discount: discount * 100,
      finalPrice,
      membershipType
    };
  };

  const handleRespondToQuote = (quoteId: string) => {
    if (!state.currentUser) {
      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'tradesperson' } });
      return;
    }

    if (state.currentUser.type !== 'tradesperson') {
      alert('Only tradespeople can respond to quote requests');
      return;
    }

    const pricing = calculateQuotePrice(state.currentUser.membershipType);

    if (state.currentUser.credits && state.currentUser.credits < pricing.finalPrice) {
      alert(`Insufficient credits. You need £${pricing.finalPrice.toFixed(2)} to respond to this quote.`);
      return;
    }

    setSelectedQuote(quoteId);
    setShowResponseModal(true);
  };

  const submitQuoteResponse = async () => {
    if (!selectedQuote || !state.currentUser || !responseData.quotedPrice || !responseData.description || !responseData.timeline) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const pricing = calculateQuotePrice(state.currentUser.membershipType);

    try {
      const responsePayload = {
        quotedPrice: parseFloat(responseData.quotedPrice),
        description: responseData.description,
        timeline: responseData.timeline
      };

      const response = await quoteService.submitQuoteResponse(selectedQuote, responsePayload);
      
      // Update local state
      setQuoteRequests(prev => prev.map(quote => 
        quote.id === selectedQuote 
          ? { ...quote, responses: [...quote.responses, response.response] }
          : quote
      ));
      
      dispatch({ type: 'RESPOND_TO_QUOTE', payload: { quoteId: selectedQuote, response: response.response } });
      
      setShowResponseModal(false);
      setResponseData({ quotedPrice: '', description: '', timeline: '' });
      setSelectedQuote(null);
      
      if (pricing.finalPrice > 0) {
        alert(`Quote submitted successfully! You've been charged £${pricing.finalPrice.toFixed(2)}.`);
      } else {
        alert('Quote submitted successfully! No charge due to your 5-year unlimited membership.');
      }
    } catch (err: any) {
      console.error('Failed to submit quote response:', err);
      alert(err.response?.data?.error || 'Failed to submit quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptQuote = (quoteId: string, responseId: string) => {
    dispatch({ type: 'ACCEPT_QUOTE_RESPONSE', payload: { quoteId, responseId } });
    alert('Quote accepted! The tradesperson will be notified.');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Quote Requests</h1>
          <p className="text-gray-600 mt-2">
            {state.currentUser?.type === 'homeowner' 
              ? 'Manage your quote requests and review responses'
              : 'Browse quote opportunities and submit your proposals'
            }
          </p>
        </div>

        {/* Membership Pricing Info for Tradespeople */}
        {state.currentUser?.type === 'tradesperson' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quote Response Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">No Membership</h3>
                <p className="text-2xl font-bold text-gray-900">£7.19</p>
                <p className="text-sm text-gray-500">£5.99 + £1.20 VAT</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                <h3 className="font-medium text-blue-900">Basic Member</h3>
                <p className="text-2xl font-bold text-blue-900">£6.47</p>
                <p className="text-sm text-blue-600">10% discount applied</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-purple-50">
                <h3 className="font-medium text-purple-900">Premium Member</h3>
                <p className="text-2xl font-bold text-purple-900">£5.39</p>
                <p className="text-sm text-purple-600">25% discount applied</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-gold-50">
                <h3 className="font-medium text-yellow-900">Lifetime Member</h3>
                <p className="text-2xl font-bold text-green-900">FREE</p>
                <p className="text-sm text-green-600">100% discount</p>
              </div>
            </div>
            {state.currentUser.membershipType && state.currentUser.membershipType !== 'none' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  Your {state.currentUser.membershipType} membership is active! 
                  {state.currentUser.membershipType === 'lifetime' 
                    ? ' You can respond to quotes for FREE!' 
                    : ` You save ${calculateQuotePrice(state.currentUser.membershipType).discount}% on each quote response.`
                  }
                </p>
              </div>
            )}
          </div>
        )}

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
        ) : quoteRequests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-600 text-lg mb-4">
              {state.currentUser?.type === 'homeowner'
                ? "You haven't created any quote requests yet."
                : "No quote requests available at the moment."}
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quoteRequests.map((quote) => {
            const canRespond = quote.responses.length < quote.maxResponses;
            const hasResponded = state.currentUser && quote.responses.some(
              response => response.tradespersonId === state.currentUser!.id
            );
            const isOwner = state.currentUser && quote.homeownerId === state.currentUser.id;

            return (
              <div key={quote.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{quote.projectTitle}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getUrgencyColor(quote.urgency)}`}>
                    {getUrgencyIcon(quote.urgency)}
                    <span className="ml-1">{quote.urgency}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{quote.projectDescription}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {quote.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {quote.budget}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Posted {new Date(quote.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    {quote.responses.length}/{quote.maxResponses} responses
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{quote.category}</span>
                  <span className="text-sm text-gray-500">by {quote.homeownerName}</span>
                </div>

                {/* Show responses if user is homeowner or has responded */}
                {(isOwner || hasResponded) && quote.responses.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Quote Responses</h4>
                    {quote.responses.map((response) => (
                      <div key={response.id} className="bg-white border rounded-lg p-3 mb-2 last:mb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{response.tradespersonName || 'Unknown'}</p>
                            <p className="text-lg font-bold text-green-600">
                              £{typeof response.quotedPrice === 'number' ? response.quotedPrice.toFixed(2) : (response.quotedPrice || '0.00')}
                            </p>
                            <p className="text-sm text-gray-600">{response.timeline || 'Not specified'}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              response.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              response.status === 'declined' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {response.status || 'pending'}
                            </span>
                            {response.membershipDiscount && response.membershipDiscount > 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                {response.membershipDiscount}% member discount
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{response.description || 'No description provided'}</p>
                        {isOwner && response.status === 'pending' && (
                          <button
                            onClick={() => handleAcceptQuote(quote.id, response.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Accept Quote
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-3">
                  {state.currentUser?.type === 'tradesperson' && !hasResponded && canRespond && (
                    <button
                      onClick={() => handleRespondToQuote(quote.id)}
                      className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                        state.currentUser.membershipType && state.currentUser.membershipType !== 'none'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Submit Quote
                      {state.currentUser.membershipType && (
                        <span className="ml-2 text-xs">
                          (£{calculateQuotePrice(state.currentUser.membershipType).finalPrice.toFixed(2)})
                        </span>
                      )}
                    </button>
                  )}

                  {hasResponded && (
                    <div className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center font-medium">
                      Quote Submitted
                    </div>
                  )}

                  {!canRespond && !hasResponded && state.currentUser?.type === 'tradesperson' && (
                    <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-center">
                      Response Limit Reached
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Quote Response Modal */}
        {showResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Submit Your Quote</h3>
              
              {state.currentUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Quote Response Fee:</p>
                    {(() => {
                      const pricing = calculateQuotePrice(state.currentUser.membershipType);
                      return (
                        <div className="text-blue-700">
                          Submit Quote £{calculateQuotePrice(state.currentUser.membershipType).finalPrice.toFixed(2)}
                          {state.currentUser.membershipType && state.currentUser.membershipType !== 'none' && (
                            <p className="text-green-600">
                              (Save {calculateQuotePrice(state.currentUser.membershipType).discount}%)
                            </p>
                          )}
                          <p className="font-bold text-lg">
                            Total: £{pricing.finalPrice.toFixed(2)}
                            {pricing.finalPrice === 0 && ' (FREE!)'}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Quote Price (£)
                  </label>
                  <input
                    type="number"
                    value={responseData.quotedPrice}
                    onChange={(e) => setResponseData({...responseData, quotedPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your quote amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Timeline
                  </label>
                  <input
                    type="text"
                    value={responseData.timeline}
                    onChange={(e) => setResponseData({...responseData, timeline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2-3 weeks"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description of Work
                  </label>
                  <textarea
                    value={responseData.description}
                    onChange={(e) => setResponseData({...responseData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe what you'll do and what's included..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuoteResponse}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={!responseData.quotedPrice || !responseData.description || !responseData.timeline || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteRequest;