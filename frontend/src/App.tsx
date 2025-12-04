import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ServiceCategories from './components/ServiceCategories';
import HowItWorks from './components/HowItWorks';
import FeaturedTradespeople from './components/FeaturedTradespeople';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import SubmitProject from './components/SubmitProject';
import JobLeads from './components/JobLeads';
import BrowseExperts from './components/BrowseExperts';
import HomeownerProfile from './components/HomeownerProfile';
import TradespersonProfile from './components/TradespersonProfile';
import Membership from './components/Membership';
import QuoteRequest from './components/QuoteRequest';
import BoostPage from './components/BoostPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import ProfileMockup from './components/ProfileMockup';
import TermsOfUse from './components/TermsOfUse';
import CookiePolicy from './components/CookiePolicy';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import VerifyEmail from './components/VerifyEmail';
import ResetPassword from './components/ResetPassword';
import { ChatProvider } from './context/ChatContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const PageSkeleton = () => (
  <div className="min-h-screen bg-white animate-pulse">
    <div className="h-20 bg-gray-100 border-b border-gray-200 mb-8"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-96 bg-gray-100 rounded-xl mb-12"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="h-64 bg-gray-100 rounded-xl"></div>
        <div className="h-64 bg-gray-100 rounded-xl"></div>
        <div className="h-64 bg-gray-100 rounded-xl"></div>
      </div>
    </div>
  </div>
);

// Home page component
const HomePage = () => (
  <>
    <Hero />
    <ServiceCategories />
    <HowItWorks />
    <FeaturedTradespeople />
    <Reviews />
    <Footer />
  </>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useApp();
  
  if (!state.currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Protected Admin Route
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// Profile route that redirects based on user type
const ProfileRoute = () => {
  const { state } = useApp();
  
  if (!state.currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return state.currentUser.type === 'homeowner' ? <HomeownerProfile /> : <TradespersonProfile />;
};

const AppContent = () => {
  const { state } = useApp();
  const location = useLocation();

  if (state.isLoading) {
    return <PageSkeleton />;
  }

  // Hide header on admin pages
  const showHeader = !location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white">
      {showHeader && <Header />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/profile-mockup" element={<ProfileMockup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        
        {/* Protected routes */}
        <Route path="/profile" element={<ProtectedRoute><ProfileRoute /></ProtectedRoute>} />
        <Route path="/submit-project" element={<ProtectedRoute><SubmitProject /></ProtectedRoute>} />
        <Route path="/job-leads" element={<ProtectedRoute><JobLeads /></ProtectedRoute>} />
        <Route path="/browse-experts" element={<ProtectedRoute><BrowseExperts /></ProtectedRoute>} />
        <Route path="/membership" element={<ProtectedRoute><Membership /></ProtectedRoute>} />
        <Route path="/quote-requests" element={<ProtectedRoute><QuoteRequest /></ProtectedRoute>} />
        <Route path="/boost" element={<ProtectedRoute><BoostPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <AppProvider>
        <ChatProvider>
          <Router>
            <AppContent />
            <AuthModal />
          </Router>
        </ChatProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  );
};

export default App;