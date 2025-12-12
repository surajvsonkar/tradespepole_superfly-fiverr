import { useState, useEffect } from 'react';
import { X, CreditCard, Check, Loader, Shield, Users, Star, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../services/paymentService';
import { useApp } from '../context/AppContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'directory_listing' | 'basic' | 'premium' | 'unlimited';
  onSuccess?: () => void;
}

const SUBSCRIPTION_DETAILS = {
  directory_listing: {
    title: 'Directory Listing',
    price: '€1',
    period: 'month',
    description: 'Get your profile listed in the directory',
    features: [
      'Your profile appears in homeowner searches',
      'Homeowners can contact you directly',
      'Increased visibility and job opportunities',
      'See your profile views and analytics',
      'Cancel anytime'
    ]
  },
  basic: {
    title: 'Basic Membership',
    price: '£29',
    period: 'month',
    description: 'For tradespeople getting started',
    features: [
      '10% discount on job leads',
      'Priority listing in search results',
      'Basic profile verification badge',
      'Monthly performance reports',
      'Cancel anytime'
    ]
  },
  premium: {
    title: 'Premium Membership',
    price: '£79',
    period: 'month',
    description: 'For established professionals',
    features: [
      '25% discount on job leads',
      'Top placement in search results',
      'Verified Professional badge',
      'Featured on homepage',
      'Detailed analytics dashboard',
      'Cancel anytime'
    ]
  },
  unlimited: {
    title: 'VIP Unlimited',
    price: '£999',
    period: '5 years',
    description: 'Best value for serious professionals',
    features: [
      'FREE unlimited job leads',
      'FREE interest expressions',
      'Permanent top placement',
      'VIP badge and verification',
      'Dedicated support',
      'One-time payment - no recurring fees'
    ]
  }
};

const CheckoutForm = ({ type, onSuccess, onClose }: { type: string; onSuccess?: () => void; onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { dispatch } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create subscription
      const subscriptionType = type === 'directory_listing' ? 'directory_listing' : 
                               type === 'basic' ? 'basic_membership' :
                               type === 'premium' ? 'premium_membership' : 'unlimited_5_year';
      
      const response = await paymentService.createSubscription(subscriptionType);
      const { clientSecret, subscriptionId, status } = response;

      console.log('Subscription response:', response);

      if (status === 'active' && !clientSecret) {
        // Subscription created without payment (free trial or already paid)
        setSuccess(true);
        
        // Update user state if directory listing subscription
        if (type === 'directory_listing') {
          dispatch({ type: 'UPDATE_USER', payload: { hasDirectoryListing: true } });
        }
        
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
        return;
      }

      if (!clientSecret) {
        throw new Error('Failed to get payment details. Please try again.');
      }

      // Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        setSuccess(true);
        
        // Update user state if directory listing subscription
        if (type === 'directory_listing') {
          dispatch({ type: 'UPDATE_USER', payload: { hasDirectoryListing: true } });
        }
        
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscription Activated!</h3>
        <p className="text-gray-600">Thank you for subscribing. You now have full access.</p>
      </div>
    );
  }

  const details = SUBSCRIPTION_DETAILS[type as keyof typeof SUBSCRIPTION_DETAILS];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-blue-900">{details.title}</h4>
            <p className="text-sm text-blue-700">{details.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{details.price}</div>
            <div className="text-sm text-blue-700">/{details.period}</div>
          </div>
        </div>
      </div>

      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#9CA3AF'
                  }
                },
                invalid: {
                  color: '#EF4444'
                }
              }
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Secure Payment Notice */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <Lock className="w-4 h-4 mr-1" />
        Secured by Stripe. Your card details are encrypted.
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Subscribe - {details.price}/{details.period}
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By subscribing, you agree to our Terms of Service. {type !== 'unlimited' && 'You can cancel anytime from your account settings.'}
      </p>
    </form>
  );
};

const SubscriptionModal = ({ isOpen, onClose, type, onSuccess }: SubscriptionModalProps) => {
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowCheckout(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const details = SUBSCRIPTION_DETAILS[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {type === 'directory_listing' ? (
                <Users className="w-6 h-6 text-blue-600 mr-2" />
              ) : type === 'unlimited' ? (
                <Star className="w-6 h-6 text-purple-600 mr-2" />
              ) : (
                <Shield className="w-6 h-6 text-blue-600 mr-2" />
              )}
              <h2 className="text-xl font-bold text-gray-900">{details.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {!showCheckout ? (
            <>
              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900">{details.price}</div>
                <div className="text-gray-600">per {details.period}</div>
                <p className="mt-2 text-gray-600">{details.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {details.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setShowCheckout(true)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  type === 'unlimited'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Subscribe Now
              </button>

              {type !== 'unlimited' && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  Cancel anytime. No commitment.
                </p>
              )}
            </>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm type={type} onSuccess={onSuccess} onClose={onClose} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;

