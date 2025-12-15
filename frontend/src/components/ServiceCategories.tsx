import React from 'react';
import { Wrench, Zap, Hammer, Paintbrush, Droplets, Home, TreePine, Car } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ServiceCategories = () => {
  const { state, dispatch } = useApp();

  const categories = [
    {
      icon: Wrench,
      name: 'Plumbing',
      description: 'Repairs, installations, and maintenance',
      color: 'bg-blue-100 text-blue-600',
      jobs: '1,200+'
    },
    {
      icon: Zap,
      name: 'Electrical',
      description: 'Wiring, lighting, and electrical repairs',
      color: 'bg-yellow-100 text-yellow-600',
      jobs: '950+'
    },
    {
      icon: Hammer,
      name: 'Construction',
      description: 'Building, renovation, and structural work',
      color: 'bg-orange-100 text-orange-600',
      jobs: '2,100+'
    },
    {
      icon: Paintbrush,
      name: 'Decorating',
      description: 'Painting, wallpapering, and interior design',
      color: 'bg-purple-100 text-purple-600',
      jobs: '800+'
    },
    {
      icon: Droplets,
      name: 'Heating & Gas',
      description: 'Boiler repairs, gas safety, and heating systems',
      color: 'bg-red-100 text-red-600',
      jobs: '650+'
    },
    {
      icon: Home,
      name: 'Roofing',
      description: 'Roof repairs, guttering, and maintenance',
      color: 'bg-green-100 text-green-600',
      jobs: '450+'
    },
    {
      icon: TreePine,
      name: 'Landscaping',
      description: 'Garden design, maintenance, and tree services',
      color: 'bg-emerald-100 text-emerald-600',
      jobs: '750+'
    },
    {
      icon: Car,
      name: 'Driveways',
      description: 'Paving, tarmac, and driveway installations',
      color: 'bg-gray-100 text-gray-600',
      jobs: '300+'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Services
          </h2>
          <p className="text-lg text-gray-600">
            Find skilled professionals for any home improvement project
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => {
                if (!state.currentUser) {
                  dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'login', userType: 'homeowner' } });
                  return;
                }
                dispatch({ type: 'SET_VIEW', payload: 'browse-experts' });
              }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 cursor-pointer group"
            >
              <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 font-medium">
                  {category.jobs} available
                </span>
                <span className="text-sm text-gray-400">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;