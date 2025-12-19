import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, UserCheck, Star, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Review } from '../types';

const MyProjects = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    jobId: '',
    tradespersonId: '',
    rating: 5,
    comment: ''
  });

  // Only show projects posted by the current homeowner
  const myProjects = state.jobLeads.filter(lead => 
    state.currentUser && lead.postedBy === state.currentUser.id
  );

  const handleAcceptInterest = (leadId: string, interestId: string) => {
    dispatch({ type: 'ACCEPT_INTEREST', payload: { leadId, interestId } });
    const interest = state.jobLeads
      .find(lead => lead.id === leadId)
      ?.interests.find(int => int.id === interestId);
    
    if (interest?.price === 0) {
      alert('Interest accepted! No charge for VIP member.');
    } else {
      alert(`Interest accepted! The tradesperson has been charged £${interest?.price.toFixed(2) || '5.99'}.`);
    }
  };

  const handleHireTradesperson = (jobId: string, tradespersonId: string) => {
    const job = state.jobLeads.find(lead => lead.id === jobId);
    const tradesperson = state.users.find(user => user.id === tradespersonId);
    
    if (!job || !tradesperson) {
      alert('Job or tradesperson not found');
      return;
    }

    dispatch({ type: 'HIRE_TRADESPERSON', payload: { jobId, tradespersonId } });
    alert(`You have hired ${tradesperson.name} for this job! The job is now closed to other applicants.`);
  };

  const handleLeaveReview = (jobId: string, tradespersonId: string) => {
    setReviewData({
      jobId,
      tradespersonId,
      rating: 5,
      comment: ''
    });
    setShowReviewModal(true);
  };

  const submitReview = () => {
    if (!state.currentUser || !reviewData.comment.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const review: Review = {
      id: `review_${Date.now()}`,
      jobId: reviewData.jobId,
      tradespersonId: reviewData.tradespersonId,
      homeownerId: state.currentUser.id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_REVIEW', payload: review });
    setShowReviewModal(false);
    setReviewData({ jobId: '', tradespersonId: '', rating: 5, comment: '' });
    alert('Review submitted successfully!');
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
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-2">
                Manage your posted projects and hire professionals
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'submit-project' })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Post New Project
              </button>
            </div>
          </div>
        </div>

        {myProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't posted any projects yet. Start by posting your first project to connect with qualified professionals.
              </p>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'submit-project' })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Post Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myProjects.map((project) => {
              const hiredTradesperson = project.hiredTradesperson ? state.users.find(u => u.id === project.hiredTradesperson) : null;

              return (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                    <div className="flex items-center space-x-2">
                      {!project.isActive ? (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                          Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                          Active
                        </span>
                      )}
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getUrgencyColor(project.urgency)}`}>
                        {getUrgencyIcon(project.urgency)}
                        <span className="ml-1">{project.urgency}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {project.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {project.budget}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Posted {project.postedDate}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      {project.interests.length} interest{project.interests.length !== 1 ? 's' : ''} • 
                      {project.purchasedBy.length} purchase{project.purchasedBy.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">{project.category}</span>
                  </div>

                  {/* Show hired tradesperson info */}
                  {hiredTradesperson && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-800 mb-1">Hired Professional</h4>
                          <p className="text-green-700">{hiredTradesperson.name}</p>
                          <p className="text-sm text-green-600">{hiredTradesperson.trades?.join(', ')}</p>
                        </div>
                        <button
                          onClick={() => handleLeaveReview(project.id, hiredTradesperson.id)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Leave Review
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show professionals who purchased this lead */}
                  {project.purchasedBy.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Professionals Who Purchased This Lead</h4>
                      {project.purchasedBy.map((tradespersonId) => {
                        // First try to get from purchasedByDetails, then fall back to state.users
                        const tradesperson = project.purchasedByDetails?.find(u => u.id === tradespersonId) 
                          || state.users.find(u => u.id === tradespersonId);
                        if (!tradesperson) {
                          // Show a placeholder for users we don't have details for
                          return (
                            <div key={tradespersonId} className="flex items-center justify-between bg-white rounded-lg p-3 mb-2 last:mb-0">
                              <div>
                                <p className="font-medium text-gray-900">Tradesperson</p>
                                <p className="text-sm text-gray-600">Contact details available</p>
                              </div>
                              {project.isActive && !project.hiredTradesperson && (
                                <button
                                  onClick={() => handleHireTradesperson(project.id, tradespersonId)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                                >
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Hire
                                </button>
                              )}
                            </div>
                          );
                        }
                        
                        return (
                          <div key={tradespersonId} className="flex items-center justify-between bg-white rounded-lg p-3 mb-2 last:mb-0">
                            <div>
                              <p className="font-medium text-gray-900">{tradesperson.name}</p>
                              <p className="text-sm text-gray-600">{tradesperson.trades?.join(', ')}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                {tradesperson.rating ? Number(tradesperson.rating).toFixed(1) : '0.0'} ({tradesperson.reviews || 0} reviews)
                              </div>
                            </div>
                            {project.isActive && !project.hiredTradesperson && (
                              <button
                                onClick={() => handleHireTradesperson(project.id, tradespersonId)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Hire
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Show interests */}
                  {project.interests.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Expressed Interests</h4>
                      {project.interests.map((interest) => (
                        <div key={interest.id} className="text-sm text-purple-700 mb-2 last:mb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p><strong>{interest.tradespersonName}</strong></p>
                              <p className="text-purple-600">{interest.message}</p>
                              <p className="text-xs text-purple-500">{interest.date}</p>
                            </div>
                            <div className="flex space-x-2">
                              {interest.status === 'pending' && project.isActive && (
                                <button
                                  onClick={() => handleAcceptInterest(project.id, interest.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                >
                                  Accept
                                </button>
                              )}
                              {interest.status === 'accepted' && project.isActive && !project.hiredTradesperson && (
                                <button
                                  onClick={() => handleHireTradesperson(project.id, interest.tradespersonId)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center"
                                >
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Hire
                                </button>
                              )}
                              {interest.status === 'accepted' && (
                                <span className="text-green-600 text-xs font-medium">Accepted</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewData({...reviewData, rating: star})}
                        className={`w-8 h-8 ${
                          star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-full h-full fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Comment
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Share your experience working with this professional..."
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  disabled={!reviewData.comment.trim()}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;