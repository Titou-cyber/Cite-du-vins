import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

const App = () => {
  // State for wines data
  const [wines, setWines] = useState([]);
  const [filteredWines, setFilteredWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [regions, setRegions] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    region: '',
    variety: '',
    minPrice: '',
    maxPrice: ''
  });
  
  // API URL
  const API_URL = 'http://localhost:3000/api';
  
  // Fetch wines on initial load and page change
  useEffect(() => {
    const fetchWines = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/wines?page=${currentPage}`);
        if (!response.ok) {
          throw new Error('Failed to fetch wines');
        }
        const data = await response.json();
        setWines(data.wines || []);
        setFilteredWines(data.wines || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWines();
  }, [currentPage]);
  
  // Fetch filter options on initial load
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch regions
        const regionsResponse = await fetch(`${API_URL}/regions`);
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json();
          setRegions(regionsData);
        }

        // Fetch varieties
        const varietiesResponse = await fetch(`${API_URL}/varieties`);
        if (varietiesResponse.ok) {
          const varietiesData = await varietiesResponse.json();
          setVarieties(varietiesData);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchFilterOptions();
  }, []);
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setFilteredWines(wines);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/wines/search?query=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setFilteredWines(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Apply filters
  const applyFilters = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.region) queryParams.append('region', filters.region);
      if (filters.variety) queryParams.append('variety', filters.variety);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

      const response = await fetch(`${API_URL}/wines/filter?${queryParams}`);
      if (!response.ok) {
        throw new Error('Filtering failed');
      }
      const data = await response.json();
      setFilteredWines(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      region: '',
      variety: '',
      minPrice: '',
      maxPrice: ''
    });
    setFilteredWines(wines);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold">Cité du Vin Marketplace</h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full md:w-1/2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search wines by name, winery or description..."
                  className="w-full p-3 pl-10 rounded-lg text-gray-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                <button 
                  type="submit" 
                  className="absolute right-2 top-2 bg-red-800 text-white p-1 rounded-md"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with Filters */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Filter size={20} className="mr-2" /> Filter Wines
              </h2>
              
              <form onSubmit={applyFilters}>
                <div className="mb-4">
                  <label htmlFor="region" className="block mb-2 text-sm font-medium text-gray-700">
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={filters.region}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Regions</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="variety" className="block mb-2 text-sm font-medium text-gray-700">
                    Grape Variety
                  </label>
                  <select
                    id="variety"
                    name="variety"
                    value={filters.variety}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Varieties</option>
                    {varieties.map((variety) => (
                      <option key={variety} value={variety}>
                        {variety}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="minPrice" className="block mb-2 text-sm font-medium text-gray-700">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="maxPrice" className="block mb-2 text-sm font-medium text-gray-700">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-800 text-white py-2 px-4 rounded-md hover:bg-red-900 transition"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
            
            {/* Recommendations Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Recommended For You</h2>
              <p className="text-gray-600 text-sm">
                Browse our collection to get personalized wine recommendations based on your preferences.
              </p>
            </div>
          </aside>
          
          {/* Wine Listings */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Available Wines</h2>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                  Error: {error}
                </div>
              )}
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
                </div>
              ) : filteredWines.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No wines found matching your criteria.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWines.map((wine, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                        <div className="p-4 relative">
                          {wine.points && (
                            <div className="absolute top-4 right-4 bg-red-800 text-white w-10 h-10 rounded-full flex flex-col items-center justify-center">
                              <span className="text-sm font-bold">{wine.points}</span>
                              <span className="text-xs">pts</span>
                            </div>
                          )}
                          
                          <h3 className="text-lg font-semibold mb-2 pr-10">{wine.title}</h3>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {wine.variety && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {wine.variety}
                              </span>
                            )}
                            {wine.region_1 && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {wine.region_1}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {wine.description || 'No description available.'}
                          </p>
                          
                          <div className="flex justify-between items-center mt-auto">
                            <div className="text-red-800 font-bold">
                              {wine.price ? `$${wine.price}` : 'Price unavailable'}
                            </div>
                            <button className="bg-red-800 text-white text-sm py-1 px-3 rounded-md hover:bg-red-900 transition flex items-center">
                              <ShoppingCart size={16} className="mr-1" /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="px-4 py-2 text-gray-700">
                        Page {currentPage}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Cité du Vin Marketplace</h2>
              <p className="text-gray-400 text-sm mt-1">A project for wine enthusiasts</p>
            </div>
            
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Cité du Vin - Class Project
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;