'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
  const heroRef = useRef(null);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const parallaxElement = heroRef.current.querySelector('.parallax');
      if (parallaxElement) {
        parallaxElement.style.transform = `translateY(${scrollY * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll down function
  const scrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={heroRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax Effect */}
      <div 
        className="parallax absolute inset-0 z-0 bg-vineyard bg-cover bg-center"
        style={{ 
          filter: 'brightness(0.6)',
          willChange: 'transform'
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Terroir
          </h1>
          
          <p className="text-xl md:text-2xl font-serif mb-8 max-w-2xl mx-auto">
            Discover the world of wine through an immersive, interactive experience
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/map" 
              className="btn-primary text-lg px-8 py-3"
            >
              Explore Wine Regions
            </Link>
            <Link 
              href="/sommelier" 
              className="btn-secondary text-lg px-8 py-3"
            >
              Find Your Perfect Wine
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Down Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        onClick={scrollDown}
      >
        <ChevronDown size={36} className="text-white" />
      </motion.div>
      
      {/* Animated Wine Glass */}
      <div className="absolute bottom-0 right-5 md:right-20 h-64 w-32 opacity-20">
        <div className="wine-glass">
          {/* This would be an SVG or CSS animation of a wine glass */}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-40 left-10 animate-bubble opacity-30">
        <div className="w-16 h-16 rounded-full border-2 border-white/30"></div>
      </div>
      <div className="absolute top-60 right-20 animate-bubble animation-delay-1000 opacity-20">
        <div className="w-10 h-10 rounded-full border border-white/30"></div>
      </div>
    </section>
  );
};

export default HeroSection;