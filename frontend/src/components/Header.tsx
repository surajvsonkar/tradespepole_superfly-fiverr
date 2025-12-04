import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, CreditCard, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services';

const Header = () => {
  const { state, dispatch } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAuthClick = (mode: 'login' | 'signup', userType: 'homeowner' | 'tradesperson') => {
    dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode, userType } });
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Get membership display info
  const getMembershipDisplay = () => {
    if (!state.currentUser?.membershipType || state.currentUser.membershipType === 'none') {
      return null;
    }
    
    const membershipNames = {
      basic: 'Basic',
      premium: 'Premium', 
      unlimited_5_year: 'VIP'
    };
    
    return membershipNames[state.currentUser.membershipType] || null;
  };

  const membershipDisplay = getMembershipDisplay();

  const navigationItems = [
    { path: '/', label: 'Home', show: true },
    { path: '/browse-experts', label: 'Browse Experts', show: state.currentUser?.type !== 'tradesperson' },
    { path: '/submit-project', label: 'Submit Project', show: state.currentUser?.type !== 'tradesperson' },
    { path: '/job-leads', label: 'Job Leads', show: state.currentUser?.type === 'tradesperson' },
    { path: '/quote-requests', label: 'Quote Requests', show: true },
    { path: '/boost', label: 'Boost Profile', show: state.currentUser?.type === 'tradesperson' },
    { path: '/membership', label: 'Membership', show: state.currentUser?.type === 'tradesperson' },
  ];

  return (
    <header className="bg-white shadow-sm border-b relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              24/7 Tradespeople
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {navigationItems.filter(item => item.show).map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`transition-colors text-sm xl:text-base whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {state.currentUser ? (
              <>
                {/* Membership Badge */}
                {membershipDisplay && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    state.currentUser.membershipType === 'unlimited_5_year' ? 'bg-purple-100 text-purple-800' :
                    state.currentUser.membershipType === 'premium' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {membershipDisplay}
                  </div>
                )}
                
                {/* Credits (Tradesperson only) */}
                {state.currentUser.type === 'tradesperson' && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="w-4 h-4 mr-1" />
                    <span className="hidden lg:inline">£</span>{state.currentUser.credits ? Number(state.currentUser.credits).toFixed(2) : '0.00'}
                  </div>
                )}
                
                {/* Profile Button */}
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 hidden lg:inline max-w-24 truncate">
                    {state.currentUser.name}
                  </span>
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 p-2"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleAuthClick('login', 'homeowner')}
                  className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 text-sm"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleAuthClick('signup', 'homeowner')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
          <div className="px-4 py-2 space-y-1">
            {/* Navigation Items */}
            {navigationItems.filter(item => item.show).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left px-3 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* User Section */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {state.currentUser ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {state.currentUser.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {state.currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {state.currentUser.type}
                        </p>
                      </div>
                      {membershipDisplay && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          state.currentUser.membershipType === 'unlimited_5_year' ? 'bg-purple-100 text-purple-800' :
                          state.currentUser.membershipType === 'premium' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {membershipDisplay}
                        </div>
                      )}
                    </div>
                    
                    {/* Credits for Tradesperson */}
                    {state.currentUser.type === 'tradesperson' && (
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Credits: £{state.currentUser.credits ? Number(state.currentUser.credits).toFixed(2) : '0.00'}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Profile and Logout */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      location.pathname === '/profile'
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-3" />
                      My Profile
                    </div>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('login', 'homeowner')}
                    className="block w-full text-left px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup', 'homeowner')}
                    className="block w-full text-left px-3 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;