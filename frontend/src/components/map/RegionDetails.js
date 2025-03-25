'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Droplets, 
  Grape, 
  Building, 
  BarChart, 
  Wine, 
  Thermometer, 
  ShoppingBag
} from 'lucide-react';

const RegionDetails = ({ region }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!region) return null;
  
  // Placeholder wine data for this region
  const regionWines = [
    {
      id: 1,
      name: `${region.name} Reserve`,
      winery: region.famousWineries[0] || 'Local Winery',
      vintage: 2018,
      rating: 94,
      price: 55,
      type: region.wineTypes[0] || 'Red'
    },
    {
      id: 2,
      name: `${region.varieties[0]} Classic`,
      winery: region.famousWineries[1] || 'Valley Estate',
      vintage: 2020,
      rating: 92,
      price: 35,
      type: region.wineTypes[0] || 'Red'
    },
    {
      id: 3,
      name: `${region.name} Grand Cru`,
      winery: region.famousWineries[2] || 'Château Heights',
      vintage: 2016,
      rating: 96,
      price: 120,
      type: region.wineTypes[0] || 'Red'
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-wine-burgundy h-3"></div>
      
      {/* Region Header */}
      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-serif font-bold text-wine-burgundy flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {region.name}
          </h2>
          <p className="text-gray-600">{region.country}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {region.wineTypes.map((type) => (
            <span 
              key={type} 
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                type === 'Red' ? 'bg-red-100 text-red-800' :
                type === 'White' ? 'bg-yellow-100 text-yellow-800' :
                type === 'Sparkling' ? 'bg-blue-100 text-blue-800' :
                type === 'Rosé' ? 'bg-pink-100 text-pink-800' :
                type === 'Dessert' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {type} Wine
            </span>
          ))}
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="border-b px-6">
        <nav className="flex overflow-x-auto -mb-px">
          <button
            className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-wine-burgundy text-wine-burgundy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'wines'
                ? 'border-wine-burgundy text-wine-burgundy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('wines')}
          >
            Notable Wines
          </button>
          <button
            className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'wineries'
                ? 'border-wine-burgundy text-wine-burgundy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('wineries')}
          >
            Wineries
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <p className="text-gray-700">{region.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Thermometer className="h-5 w-5 text-wine-burgundy mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Climate</h4>
                    <p className="text-gray-600">{region.climate}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Droplets className="h-5 w-5 text-wine-burgundy mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Soil</h4>
                    <p className="text-gray-600">{region.soil}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Grape className="h-5 w-5 text-wine-burgundy mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Key Grape Varieties</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {region.varieties.map(variety => (
                        <span key={variety} className="px-2 py-1 bg-wine-burgundy/10 text-wine-burgundy rounded-full text-xs">
                          {variety}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <BarChart className="h-5 w-5 text-wine-burgundy mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Production</h4>
                    <p className="text-gray-600">{region.yearlyProduction}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Wine className="h-5 w-5 text-wine-burgundy mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Wine Styles</h4>
                    <p className="text-gray-600">
                      {region.wineTypes.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link 
                href={`/learn/regions/${region.id}`}
                className="btn-outline inline-flex items-center"
              >
                Learn More About {region.name}
              </Link>
            </div>
          </div>
        )}
        
        {activeTab === 'wines' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notable Wines from {region.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {regionWines.map(wine => (
                <div key={wine.id} className="wine-card">
                  <div className="p-4">
                    <div className="h-36 flex items-center justify-center bg-gray-50 rounded mb-3">
                      <Wine className="h-12 w-12 text-wine-burgundy/30" />
                    </div>
                    
                    <h4 className="font-medium text-gray-900 line-clamp-1">{wine.name}</h4>
                    <p className="text-gray-600 text-sm">{wine.winery} · {wine.vintage}</p>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <span className="bg-wine-gold/20 text-wine-burgundy px-2 py-1 rounded text-sm font-medium">
                        {wine.rating} pts
                      </span>
                      <span className="font-semibold">${wine.price}</span>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 border-t">
                    <Link 
                      href={`/wines/${wine.id}`}
                      className="flex items-center justify-center gap-1 text-sm font-medium text-wine-burgundy hover:underline"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>View Wine</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Link 
                href={`/wines?region=${region.name}`}
                className="btn-primary inline-flex items-center"
              >
                Explore All {region.name} Wines
              </Link>
            </div>
          </div>
        )}
        
        {activeTab === 'wineries' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notable Wineries in {region.name}</h3>
            
            <div className="divide-y">
              {region.famousWineries.map((winery, index) => (
                <div key={index} className="py-4 flex items-start">
                  <Building className="h-5 w-5 text-wine-burgundy mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">{winery}</h4>
                    <p className="text-gray-600 text-sm">
                      {region.name}, {region.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Link 
                href={`/wineries?region=${region.name}`}
                className="btn-outline inline-flex items-center"
              >
                Explore All Wineries in {region.name}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionDetails;