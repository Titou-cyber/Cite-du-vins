'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    text: "The interactive wine map completely transformed how I understand wine regions. It's like taking a virtual tour through the vineyards!",
    name: "Sophie Laurent",
    title: "Wine Enthusiast",
    image: "/images/testimonials/testimonial-1.jpg"
  },
  {
    id: 2,
    text: "The AI Sommelier recommended a Châteauneuf-du-Pape that perfectly matched my taste preferences. I've discovered so many new favorites!",
    name: "Michael Chen",
    title: "Casual Wine Drinker",
    image: "/images/testimonials/testimonial-2.jpg"
  },
  {
    id: 3,
    text: "As a sommelier in training, the knowledge graph has been invaluable for understanding the connections between wine varieties and regions.",
    name: "Isabella Rodriguez",
    title: "Sommelier Student",
    image: "/images/testimonials/testimonial-3.jpg"
  }
];

const TestimonialSection = () => {
  const [current, setCurrent] = useState(0);
  
  // Auto rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleDotClick = (index) => {
    setCurrent(index);
  };
  
  return (
    <section className="bg-wine-cream py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <Quote className="w-12 h-12 text-wine-burgundy mx-auto mb-4" />
          <h2 className="section-title">What Our Users Say</h2>
        </div>
        
        <div className="relative h-80">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonials[current].id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-6 border-4 border-wine-burgundy shadow-lg">
                  <Image
                    src={testimonials[current].image || "/images/testimonials/placeholder.jpg"}
                    alt={testimonials[current].name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                <blockquote className="text-xl font-serif italic text-gray-800 max-w-2xl mb-8">
                  "{testimonials[current].text}"
                </blockquote>
                
                <div>
                  <p className="font-bold text-wine-burgundy">{testimonials[current].name}</p>
                  <p className="text-gray-600">{testimonials[current].title}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Dots navigation */}
        <div className="flex justify-center space-x-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                current === index ? 'bg-wine-burgundy' : 'bg-gray-300'
              }`}
              aria-label={`View testimonial ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;