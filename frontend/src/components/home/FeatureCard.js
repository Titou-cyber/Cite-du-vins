'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon, title, description, link, color = 'wine-burgundy' }) => {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className={`bg-${color} h-2`}></div>
      <div className="p-6">
        <div className={`w-14 h-14 rounded-full bg-${color}/10 flex items-center justify-center mb-4 text-${color}`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-serif font-semibold mb-3">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        
        <Link href={link} className={`inline-flex items-center text-${color} font-medium hover:underline`}>
          <span>Explore</span>
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default FeatureCard;