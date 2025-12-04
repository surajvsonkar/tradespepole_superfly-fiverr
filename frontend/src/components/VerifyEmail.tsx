import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { authService } from '../services/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">Your account has been successfully verified.</p>
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Home
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-red-600 mb-6">{message}</p>
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Return to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
