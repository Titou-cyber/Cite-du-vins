'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';

const WineCarousel = ({ wines = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);
  
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % wines.length);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + wines.length) % wines.length);
  };
  
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  
  // Set up auto play
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, wines.length]);
  
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
  };
  
  const resumeAutoPlay = () => {
    setIsAutoPlaying(true);
  };
  
  // If no wines are provided, return null
  if (!wines.length) return null;
  
  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      <div className="relative min-h-[400px]">
        {wines.map((wine, index) => (
          <motion.div
            key={wine.id}
            className={`absolute inset-0 flex flex-col md:flex-row items-center gap-10 ${
              index === currentIndex ? 'block' : 'hidden'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Wine Bottle Image */}
            <div className="md:w-1/3 flex justify-center">
              <div className="relative w-40 h-56">
                <Image
                  src={wine.image || '/images/wine-placeholder.png'}
                  alt={wine.name}
                  width={160}
                  height={400}
                  className="object-contain wine-bottle animate-wine-pour"
                />
              </div>
            </div>
            
            {/* Wine Details */}
            <div className="md:w-2/3 text-center md:text-left">
              <h3 className="text-2xl font-serif font-bold mb-2">
                {wine.name}
              </h3>
              
              <div className="flex items-center justify-center md:justify-start mb-3">
                <span className="text-wine-gold mr-2">{wine.rating}/100</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.round(wine.rating / 20)
                          ? 'text-wine-gold fill-wine-gold'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-wine-cream/90 mb-3">
                {wine.region}
              </p>
              
              <p className="text-wine-cream/90 mb-4">
                <span className="font-semibold">{wine.type} Wine</span> • ${wine.price}
              </p>
              
              <Link 
                href={`/wines/${wine.id}`}
                className="inline-block py-2 px-6 bg-wine-gold text-wine-burgundy rounded-md hover:bg-opacity-90 transition-colors"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
        <button 
          onClick={prevSlide}
          className="ml-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors pointer-events-auto"
        >
          <ArrowLeft size={20} />
        </button>
        
        <button 
          onClick={nextSlide}
          className="mr-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors pointer-events-auto"
        >
          <ArrowRight size={20} />
        </button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {wines.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default WineCarousel;