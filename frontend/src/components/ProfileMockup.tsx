import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Building, 
  Star, 
  FileText, 
  CreditCard, 
  Settings, 
  MapPin, 
  Users, 
  Bell, 
  HelpCircle, 
  LogOut, 
  Edit 
} from 'lucide-react';

const ProfileMockup = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company-description');
  const [companyDescription, setCompanyDescription] = useState('20 plus years in home renovations, we supply and fit materials at below only jobs domestic and commercial.');
  const [guarantee, setGuarantee] = useState('yes');

  const sidebarItems = [
    {
      id: 'home-counties',
      label: 'HOME COUNTIES RENOVATIONS',
      icon: Building,
      type: 'header'
    },
    {
      id: 'company-description',
      label: 'Company description',
      icon: FileText,
      type: 'nav'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: Star,
      type: 'nav'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: User,
      type: 'nav'
    },
    {
      id: 'account',
      label: 'Account',
      icon: Settings,
      type: 'section'
    },
    {
      id: 'contact-details',
      label: 'Contact details',
      icon: User,
      type: 'nav'
    },
    {
      id: 'manage-account',
      label: 'Manage account',
      icon: Settings,
      type: 'nav'
    },
    {
      id: 'saved-leads',
      label: 'Saved leads',
      icon: FileText,
      type: 'nav'
    },
    {
      id: 'lead-settings',
      label: 'Lead settings',
      icon: Settings,
      type: 'section'
    },
    {
      id: 'work-area',
      label: 'Work area',
      icon: MapPin,
      type: 'nav'
    },
    {
      id: 'services',
      label: 'Services',
      icon: Users,
      type: 'nav'
    },
    {
      id: 'message-templates',
      label: 'My message templates',
      icon: FileText,
      type: 'nav'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      type: 'nav'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      type: 'section'
    },
    {
      id: 'balance',
      label: 'Balance',
      icon: CreditCard,
      type: 'nav'
    },
    {
      id: 'payments-nav',
      label: 'Payments',
      icon: CreditCard,
      type: 'nav'
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      type: 'section'
    },
    {
      id: 'support-centre',
      label: 'Support centre',
      icon: HelpCircle,
      type: 'nav'
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: Star,
      type: 'section'
    },
    {
      id: 'trade-perks',
      label: 'Trade Perks',
      icon: Star,
      type: 'nav'
    },
    {
      id: 'log-out',
      label: 'Log out',
      icon: LogOut,
      type: 'nav'
    }
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'log-out') {
      alert('Logging out...');
      return;
    }
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'company-description':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Company description</h2>
                <button className="text-blue-600 hover:text-blue-700 flex items-center">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About your company
                </label>
                <textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell customers about your company..."
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guarantee</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Increase your chances of getting hired by offering a guarantee
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="guarantee"
                      value="yes"
                      checked={guarantee === 'yes'}
                      onChange={(e) => setGuarantee(e.target.value)}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Yes, I offer a guarantee</div>
                      <div className="text-sm text-gray-600">Homeowners are more guaranteed very and should discuss the terms in advance</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="guarantee"
                      value="no"
                      checked={guarantee === 'no'}
                      onChange={(e) => setGuarantee(e.target.value)}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">No, I do not offer a guarantee</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews yet</p>
              <p className="text-sm text-gray-500 mt-2">Reviews from customers will appear here</p>
            </div>
          </div>
        );

      case 'portfolio':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No portfolio items yet</p>
              <p className="text-sm text-gray-500 mt-2">Add photos of your work to showcase your skills</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add Portfolio Item
              </button>
            </div>
          </div>
        );

      case 'contact-details':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Contact details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business name</label>
                <input
                  type="text"
                  defaultValue="Home Counties Renovations"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact name</label>
                <input
                  type="text"
                  defaultValue="Mike Wilson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="mike.w@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="07700 900123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'work-area':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Work area</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-2">Set your work area</h3>
              <p className="text-blue-700 mb-4">Define where you're willing to travel for jobs</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Set Work Area
              </button>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Building', 'Renovation', 'Plumbing', 'Electrical', 'Painting', 'Roofing'].map((service) => (
                <label key={service} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" className="mr-3 text-blue-600 focus:ring-blue-500" />
                  <span className="text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'balance':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Balance</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">£25.50</div>
                <p className="text-green-700">Current balance</p>
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Top Up Balance
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            <div className="space-y-4">
              {['Email notifications', 'SMS notifications', 'Push notifications'].map((type) => (
                <label key={type} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">{type}</span>
                  <input type="checkbox" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">This section is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-blue-600 hover:text-blue-700 mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">24/7 Tradespeople</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">New leads</span>
            <span className="text-sm text-gray-600">Activity</span>
            <span className="text-sm text-gray-600">Contacts</span>
            <span className="text-sm text-gray-600">My account</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
            
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                if (item.type === 'header') {
                  return (
                    <div key={item.id} className="flex items-center py-3 px-3 bg-gray-50 rounded-lg mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500">View profile</div>
                      </div>
                    </div>
                  );
                }
                
                if (item.type === 'section') {
                  return (
                    <div key={item.id} className="pt-6 pb-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </h3>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfileMockup;