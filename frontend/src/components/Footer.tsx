import { useState, useEffect } from 'react';
import { Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
}

const Footer = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: 'https://www.facebook.com/247Tradespeople',
    instagram: 'https://www.instagram.com/247tradespeople/',
    twitter: 'https://twitter.com/247Tradespeople',
    linkedin: 'https://www.linkedin.com/company/247tradespeople/'
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings/public`);
        if (response.data?.settings?.social_media_links) {
          setSocialLinks(response.data.settings.social_media_links);
        }
      } catch (error) {
        console.error('Failed to fetch social links:', error);
      }
    };
    fetchSocialLinks();
  }, []);

  const handleSocialClick = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <span className="text-2xl font-bold">24/7 Tradespeople</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted platform for connecting with skilled home improvement professionals nationwide.
            </p>
            <div className="flex space-x-4">
              <Facebook 
                className={`cursor-pointer w-5 h-5 ${socialLinks.facebook ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600'}`}
                onClick={() => handleSocialClick(socialLinks.facebook)}
              />
              <Twitter 
                className={`cursor-pointer w-5 h-5 ${socialLinks.twitter ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600'}`}
                onClick={() => handleSocialClick(socialLinks.twitter)}
              />
              <Instagram 
                className={`cursor-pointer w-5 h-5 ${socialLinks.instagram ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600'}`}
                onClick={() => handleSocialClick(socialLinks.instagram)}
              />
              <Linkedin 
                className={`cursor-pointer w-5 h-5 ${socialLinks.linkedin ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600'}`}
                onClick={() => handleSocialClick(socialLinks.linkedin)}
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Property Owners</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => {
                    if (!state.currentUser) {
                      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'homeowner' } });
                      return;
                    }
                    navigate('/submit-project');
                  }}
                  className="hover:text-white text-left"
                >
                  Submit Project
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (!state.currentUser) {
                      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'login', userType: 'homeowner' } });
                      return;
                    }
                    navigate('/browse-experts');
                  }}
                  className="hover:text-white text-left"
                >
                  Browse Professionals
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="hover:text-white text-left"
                >
                  Client Reviews
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (!state.currentUser) {
                      dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'homeowner' } });
                      return;
                    }
                    navigate('/submit-project');
                  }}
                  className="hover:text-white text-left"
                >
                  Get Estimates
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="hover:text-white text-left"
                >
                  Project Guide
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Professionals</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'tradesperson' } })}
                  className="hover:text-white text-left"
                >
                  Join 24/7 Tradespeople
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/job-leads')}
                  className="hover:text-white text-left"
                >
                  Find Projects
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/membership')}
                  className="hover:text-white text-left"
                >
                  Membership Plans
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="hover:text-white text-left"
                >
                  Pro Resources
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="hover:text-white text-left"
                >
                  Support Hub
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>support@247tradespeople.com</span>
              </div>
              <p className="text-sm">Available 24/7 for your convenience</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 24/7 Tradespeople. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-white text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-use"
                className="text-gray-400 hover:text-white text-sm"
              >
                Terms of Use
              </Link>
              <Link
                to="/cookie-policy"
                className="text-gray-400 hover:text-white text-sm"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;