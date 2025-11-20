import { useState } from 'react';
import { X, Calculator, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuoteRequest } from '../types';
import { quoteService } from '../services/quoteService';

interface QuickQuoteProps {
  isOpen: boolean;
  onClose: () => void;
  tradeName: string;
}

const QuickQuote = ({ isOpen, onClose, tradeName }: QuickQuoteProps) => {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectType: '',
    urgency: '',
    budget: '',
    description: '',
    contact: {
      name: '',
      email: '',
      phone: '',
      postcode: ''
    }
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!state.currentUser) {
      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'homeowner' } });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Map frontend urgency values to backend enum (Low, Medium, High)
      const mapUrgency = (urgency: string): 'Low' | 'Medium' | 'High' => {
        switch (urgency) {
          case 'asap':
            return 'High';
          case 'week':
            return 'High';
          case 'month':
            return 'Medium';
          case 'flexible':
            return 'Low';
          default:
            return 'Medium';
        }
      };

      // Create quote request via API
      const quoteData = {
        projectTitle: `${tradeName} - ${formData.projectType}`,
        projectDescription: formData.description,
        category: tradeName,
        location: formData.contact.postcode,
        budget: formData.budget,
        urgency: mapUrgency(formData.urgency),
        contactDetails: {
          name: formData.contact.name,
          email: formData.contact.email,
          phone: formData.contact.phone
        }
      };

      const response = await quoteService.createQuoteRequest(quoteData);
      
      // Update local state with the created quote
      dispatch({ type: 'ADD_QUOTE_REQUEST', payload: response.quoteRequest });
      
      alert('Quote request submitted! Tradespeople can now respond with their quotes.');
      onClose();
      setStep(1);
      setFormData({
        projectType: '',
        urgency: '',
        budget: '',
        description: '',
        contact: { name: '', email: '', phone: '', postcode: '' }
      });
    } catch (err: any) {
      console.error('Failed to create quote request:', err);
      setError(err.response?.data?.error || 'Failed to submit quote request. Please try again.');
      alert('Failed to submit quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calculator className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Quick Quote</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {step} of 3</span>
              <span>{tradeName}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of work do you need?
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select project type</option>
                  <option value="repair">Repair/Fix</option>
                  <option value="installation">New Installation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="renovation">Renovation</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When do you need this done?
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select timeframe</option>
                  <option value="asap">ASAP</option>
                  <option value="week">Within a week</option>
                  <option value="month">Within a month</option>
                  <option value="flexible">I'm flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated budget
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select budget range</option>
                  <option value="under-500">Under £500</option>
                  <option value="500-1000">£500 - £1,000</option>
                  <option value="1000-5000">£1,000 - £5,000</option>
                  <option value="5000-plus">£5,000+</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Description</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your project in detail
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide as much detail as possible about what you need done..."
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Quick Response</h4>
                    <p className="text-sm text-blue-600">
                      You'll typically receive quotes within 2-4 hours from verified professionals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Contact Details</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={formData.contact.name}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contact: {...formData.contact, name: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                  required
                />
                
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contact: {...formData.contact, email: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Your email address"
                  required
                />
                
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contact: {...formData.contact, phone: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Your phone number"
                  required
                />
                
                <input
                  type="text"
                  value={formData.contact.postcode}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contact: {...formData.contact, postcode: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Your postcode"
                  required
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Free Service</h4>
                    <p className="text-sm text-green-600">
                      Getting quotes is completely free for homeowners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!formData.projectType || !formData.urgency || !formData.budget)) ||
                    (step === 2 && !formData.description)
                  }
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.contact.name || !formData.contact.email || !formData.contact.phone || !formData.contact.postcode || loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Get My Quotes'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickQuote;