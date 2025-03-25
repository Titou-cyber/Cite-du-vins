'use client';

import { useState, useEffect } from 'react';
import { Filter, X, Check } from 'lucide-react';

const MapFilters = ({ filters, onFilterChange, regions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [availableOptions, setAvailableOptions] = useState({
    continents: [],
    countries: [],
    wineTypes: [],
    varietals: []
  });
  
  // Extract unique filter options from regions data
  useEffect(() => {
    if (regions.length > 0) {
      const continents = [...new Set(regions.map(r => r.continent))].sort();
      const countries = [...new Set(regions.map(r => r.country))].sort();
      const wineTypes = [...new Set(regions.flatMap(r => r.wineTypes))].sort();
      const varietals = [...new Set(regions.flatMap(r => r.varieties))].sort();
      
      setAvailableOptions({
        continents,
        countries,
        wineTypes,
        varietals
      });
    }
  }, [regions]);
  
  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };
  
  const handleFilterChange = (filterType, value) => {
    const updatedFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(updatedFilters);
  };
  
  const handleVarietalToggle = (varietal) => {
    const updatedVarietals = localFilters.varietals.includes(varietal)
      ? localFilters.varietals.filter(v => v !== varietal)
      : [...localFilters.varietals, varietal];
    
    handleFilterChange('varietals', updatedVarietals);
  };
  
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  const resetFilters = () => {
    const resetFilters = {
      continent: 'all',
      country: 'all',
      wineType: 'all',
      varietals: []
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-wine-burgundy text-white flex justify-between items-center">
        <h3 className="font-serif text-lg">Filter Regions</h3>
        <button 
          onClick={toggleFilters}
          className="md:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
        >
          {isOpen ? <X size={16} /> : <Filter size={16} />}
        </button>
      </div>
      
      <div className={`p-4 border-b md:block ${isOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-6">
          {/* Continent Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Continent
            </label>
            <select
              value={localFilters.continent}
              onChange={(e) => handleFilterChange('continent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-burgundy"
            >
              <option value="all">All Continents</option>
              {availableOptions.continents.map((continent) => (
                <option key={continent} value={continent}>
                  {continent}
                </option>
              ))}
            </select>
          </div>
          
          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={localFilters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-burgundy"
            >
              <option value="all">All Countries</option>
              {availableOptions.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          
          {/* Wine Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wine Type
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('wineType', 'all')}
                className={`px-3 py-1 text-sm rounded-full border ${
                  localFilters.wineType === 'all'
                    ? 'bg-wine-burgundy text-white border-wine-burgundy'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {availableOptions.wineTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('wineType', type)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    localFilters.wineType === type
                      ? 'bg-wine-burgundy text-white border-wine-burgundy'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Grape Varietals Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grape Varietals
            </label>
            <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
              {availableOptions.varietals.map((varietal) => (
                <div key={varietal} className="flex items-center">
                  <button
                    onClick={() => handleVarietalToggle(varietal)}
                    className="flex items-center w-full text-left"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      localFilters.varietals.includes(varietal)
                        ? 'bg-wine-burgundy border-wine-burgundy'
                        : 'border-gray-300'
                    }`}>
                      {localFilters.varietals.includes(varietal) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{varietal}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className={`p-4 flex justify-between md:flex ${isOpen ? 'flex' : 'hidden'}`}>
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-sm text-gray-700 hover:text-wine-burgundy"
        >
          Reset All
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 text-sm bg-wine-burgundy text-white rounded-md hover:bg-wine-red transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default MapFilters;