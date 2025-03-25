'use client';

import { useState, useEffect } from 'react';
import MapVisualization from '@/components/map/MapVisualization';
import RegionDetails from '@/components/map/RegionDetails';
import MapFilters from '@/components/map/MapFilters';

export default function MapPage() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    continent: 'all',
    country: 'all',
    wineType: 'all',
    varietals: []
  });

  useEffect(() => {
    // In a real app, we would fetch this data from the API
    // For now, we'll use mock data
    const fetchRegions = async () => {
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockRegions = [
          {
            id: 1,
            name: 'Bordeaux',
            country: 'France',
            continent: 'Europe',
            coordinates: { lat: 44.8378, lng: -0.5792 },
            description: 'One of the most prestigious wine regions in the world, known for red blends based on Cabernet Sauvignon and Merlot.',
            climate: 'Maritime',
            soil: 'Gravel, Clay, Limestone',
            varieties: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Petit Verdot'],
            wineTypes: ['Red', 'White', 'Dessert'],
            famousWineries: ['Château Margaux', 'Château Lafite Rothschild', 'Château Latour'],
            yearlyProduction: '700 million bottles',
            isActive: true
          },
          {
            id: 2,
            name: 'Burgundy',
            country: 'France',
            continent: 'Europe',
            coordinates: { lat: 47.0521, lng: 4.3875 },
            description: 'Famous for terroir-focused wines made from Pinot Noir and Chardonnay, with a complex classification system.',
            climate: 'Continental',
            soil: 'Limestone, Clay, Marl',
            varieties: ['Pinot Noir', 'Chardonnay', 'Aligoté'],
            wineTypes: ['Red', 'White'],
            famousWineries: ['Domaine de la Romanée-Conti', 'Domaine Leroy', 'Domaine Leflaive'],
            yearlyProduction: '200 million bottles',
            isActive: true
          },
          {
            id: 3,
            name: 'Tuscany',
            country: 'Italy',
            continent: 'Europe',
            coordinates: { lat: 43.7711, lng: 11.2486 },
            description: 'Home to Chianti, Brunello di Montalcino, and Super Tuscans, with Sangiovese as the dominant grape.',
            climate: 'Mediterranean',
            soil: 'Clay, Limestone, Sandstone, Schist',
            varieties: ['Sangiovese', 'Cabernet Sauvignon', 'Merlot'],
            wineTypes: ['Red', 'White'],
            famousWineries: ['Antinori', 'Tenuta San Guido', 'Biondi-Santi'],
            yearlyProduction: '250 million bottles',
            isActive: true
          },
          {
            id: 4,
            name: 'Napa Valley',
            country: 'United States',
            continent: 'North America',
            coordinates: { lat: 38.5025, lng: -122.2654 },
            description: 'Premier wine region in the US, renowned for high-quality Cabernet Sauvignon and Chardonnay.',
            climate: 'Mediterranean',
            soil: 'Volcanic, Sedimentary',
            varieties: ['Cabernet Sauvignon', 'Chardonnay', 'Merlot', 'Pinot Noir'],
            wineTypes: ['Red', 'White', 'Sparkling'],
            famousWineries: ['Opus One', 'Screaming Eagle', 'Harlan Estate'],
            yearlyProduction: '30 million bottles',
            isActive: true
          },
          {
            id: 5,
            name: 'Mendoza',
            country: 'Argentina',
            continent: 'South America',
            coordinates: { lat: -32.8908, lng: -68.8272 },
            description: 'High-altitude vineyards known for producing world-class Malbec with intense flavor and color.',
            climate: 'Continental, Semi-Desert',
            soil: 'Alluvial, Sandy',
            varieties: ['Malbec', 'Cabernet Sauvignon', 'Torrontés'],
            wineTypes: ['Red', 'White'],
            famousWineries: ['Catena Zapata', 'Achaval-Ferrer', 'Bodega Aleanna'],
            yearlyProduction: '900 million liters',
            isActive: true
          }
        ];

        setRegions(mockRegions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching regions:', error);
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Apply filters to regions
  const filteredRegions = regions.filter(region => {
    if (filters.continent !== 'all' && region.continent !== filters.continent) return false;
    if (filters.country !== 'all' && region.country !== filters.country) return false;
    if (filters.wineType !== 'all' && !region.wineTypes.includes(filters.wineType)) return false;
    if (filters.varietals.length > 0 && !filters.varietals.some(v => region.varieties.includes(v))) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-20">
      <div className="page-container">
        <h1 className="section-title text-center mb-2">
          Interactive Wine Region Map
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Explore the world's most renowned wine regions, discover their unique characteristics, and learn about the wines they produce.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <MapFilters 
              filters={filters} 
              onFilterChange={handleFilterChange}
              regions={regions}
            />
          </div>

          {/* Map and Region Details */}
          <div className="lg:col-span-3 space-y-8">
            <MapVisualization 
              regions={filteredRegions}
              selectedRegion={selectedRegion}
              onRegionSelect={handleRegionSelect}
              loading={loading}
            />

            {selectedRegion && (
              <RegionDetails region={selectedRegion} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}