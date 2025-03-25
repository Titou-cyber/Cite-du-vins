'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Loader } from 'lucide-react';

// Dynamically import the Globe component to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

const MapVisualization = ({ regions = [], selectedRegion, onRegionSelect, loading }) => {
  const [initialized, setInitialized] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'
  const globeRef = useRef(null);

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('globe-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(500, window.innerHeight * 0.6)
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Initialize globe once data is loaded
  useEffect(() => {
    if (regions.length > 0 && globeRef.current && !initialized) {
      // Start with a zoomed-out view
      globeRef.current.pointOfView({
        lat: 20,
        lng: 0,
        altitude: 2.5
      }, 1000);
      
      setInitialized(true);
    }
  }, [regions, initialized]);

  // Pan to selected region
  useEffect(() => {
    if (selectedRegion && globeRef.current) {
      const { lat, lng } = selectedRegion.coordinates;
      globeRef.current.pointOfView({
        lat,
        lng,
        altitude: 1.5
      }, 1000);
    }
  }, [selectedRegion]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    
    if (mode === '2d') {
      globeRef.current.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 4
      }, 1000);
    } else {
      globeRef.current.pointOfView({
        lat: 20,
        lng: 0,
        altitude: 2.5
      }, 1000);
    }
  };

  const regionData = regions.map(region => ({
    ...region,
    lat: region.coordinates.lat,
    lng: region.coordinates.lng,
    size: selectedRegion?.id === region.id ? 0.6 : 0.4,
    color: selectedRegion?.id === region.id ? '#E6C17B' : '#722F37'
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center" style={{ height: 500 }}>
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-wine-burgundy mx-auto mb-4" />
          <p className="text-gray-600">Loading wine regions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-wine-burgundy text-white flex justify-between items-center">
        <h3 className="font-serif text-lg">Wine Regions of the World</h3>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="showLabels" 
              checked={showLabels} 
              onChange={() => setShowLabels(!showLabels)}
              className="rounded text-wine-gold focus:ring-wine-gold"
            />
            <label htmlFor="showLabels" className="text-sm">Show Labels</label>
          </div>
          
          <div className="flex bg-black/20 rounded-md p-1">
            <button 
              className={`px-3 py-1 text-sm rounded-md transition ${
                viewMode === '3d' ? 'bg-white text-wine-burgundy' : 'text-white'
              }`}
              onClick={() => handleViewModeChange('3d')}
            >
              3D
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md transition ${
                viewMode === '2d' ? 'bg-white text-wine-burgundy' : 'text-white'
              }`}
              onClick={() => handleViewModeChange('2d')}
            >
              2D
            </button>
          </div>
        </div>
      </div>
      
      <div id="globe-container" style={{ position: 'relative', height: dimensions.height }}>
        {initialized && (
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="/images/map/earth-blue-marble.jpg"
            bumpImageUrl="/images/map/earth-topology.png"
            backgroundImageUrl="/images/map/night-sky.png"
            pointsData={regionData}
            pointLabel={d => showLabels ? `<div class="text-xs font-bold p-1 bg-white/80 backdrop-blur-sm rounded">${d.name}, ${d.country}</div>` : ''}
            pointRadius="size"
            pointColor="color"
            pointAltitude={0.01}
            onPointClick={point => onRegionSelect(point)}
            pointsMerge={false}
            atmosphereColor="#4E0707"
            atmosphereAltitude={0.25}
            globeProjection={viewMode === '2d' ? 'equirectangular' : 'globe'}
          />
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-wine-burgundy inline-block mr-2"></span>
              <span className="text-sm text-gray-600">Wine Region</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-wine-gold inline-block mr-2"></span>
              <span className="text-sm text-gray-600">Selected Region</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {regionData.length} regions displayed • Drag to rotate • Scroll to zoom
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;