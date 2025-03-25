'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Wine, MapPin, Users, GraduationCap, Sparkles } from 'lucide-react';

import HeroSection from '@/components/home/HeroSection';
import FeatureCard from '@/components/home/FeatureCard';
import WineCarousel from '@/components/home/WineCarousel';
import TestimonialSection from '@/components/home/TestimonialSection';

export default function Home() {
  const [featuredWines, setFeaturedWines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For now, using placeholder data
    const mockWines = [
      {
        id: 1,
        name: "Château Margaux 2015",
        region: "Bordeaux, France",
        type: "Red",
        price: 699,
        rating: 98,
        image: "/images/wines/chateau-margaux.jpg"
      },
      {
        id: 2,
        name: "Antinori Tignanello 2018",
        region: "Tuscany, Italy",
        type: "Red",
        price: 135,
        rating: 96,
        image: "/images/wines/tignanello.jpg"
      },
      {
        id: 3,
        name: "Dom Pérignon 2012",
        region: "Champagne, France",
        type: "Sparkling",
        price: 225,
        rating: 97,
        image: "/images/wines/dom-perignon.jpg"
      },
      {
        id: 4,
        name: "Cloudy Bay Sauvignon Blanc 2022",
        region: "Marlborough, New Zealand",
        type: "White",
        price: 35,
        rating: 93,
        image: "/images/wines/cloudy-bay.jpg"
      }
    ];
    
    setFeaturedWines(mockWines);
    setLoading(false);
  }, []);
  
  return (
    <>
      <HeroSection />
      
      {/* Featured Experiences */}
      <section className="page-container py-16">
        <h2 className="section-title text-center mb-12">
          Embark on a Journey of Wine Discovery
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<MapPin size={32} />}
            title="Interactive Map"
            description="Explore wine regions around the world through our interactive 3D map"
            link="/map"
            color="wine-burgundy"
          />
          
          <FeatureCard 
            icon={<Sparkles size={32} />}
            title="AI Sommelier"
            description="Get personalized wine recommendations based on your preferences"
            link="/sommelier"
            color="wine-purple"
          />
          
          <FeatureCard 
            icon={<Users size={32} />}
            title="Virtual Tastings"
            description="Join live tastings or follow self-guided experiences"
            link="/tastings"
            color="wine-red"
          />
          
          <FeatureCard 
            icon={<GraduationCap size={32} />}
            title="Knowledge Graph"
            description="Discover the interconnected world of wine through our interactive database"
            link="/learn"
            color="wine-bottle"
          />
        </div>
      </section>
      
      {/* Featured Wines */}
      <section className="bg-wine-red text-white py-16">
        <div className="page-container">
          <h2 className="section-title text-center text-white mb-2">
            Discover Exceptional Wines
          </h2>
          <p className="text-center text-wine-cream/80 mb-12">
            Curated selections from around the world
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-wine-cream"></div>
            </div>
          ) : (
            <WineCarousel wines={featuredWines} />
          )}
          
          <div className="flex justify-center mt-10">
            <Link href="/wines" className="btn-outline border-white text-white hover:bg-white hover:text-wine-red">
              Explore All Wines
            </Link>
          </div>
        </div>
      </section>
      
      {/* La Cité Du Vin Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-citeduvin bg-cover bg-center opacity-10"></div>
        <div className="page-container relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title">La Cité Du Vin</h2>
              <p className="text-lg mb-6">
                Located in Bordeaux, La Cité du Vin is a unique cultural facility where wine comes to life through an immersive, sensorial approach, all set within an evocative architectural design.
              </p>
              <p className="mb-8">
                Our digital experience extends the mission of La Cité Du Vin, bringing the cultural heritage of wine to a global audience through innovative technology and interactive experiences.
              </p>
              <Link href="/about" className="btn-primary">
                Learn More About La Cité Du Vin
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/cite-du-vin-building.jpg"
                  alt="La Cité Du Vin building in Bordeaux"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <TestimonialSection />
      
      {/* Newsletter Signup */}
      <section className="bg-wine-gold/20 py-16">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center">
            <Wine className="mx-auto text-wine-burgundy mb-4" size={40} />
            <h2 className="section-title">Join Our Wine Community</h2>
            <p className="mb-8">
              Subscribe to our newsletter for exclusive content, event invitations, and personalized recommendations.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="input-field flex-1"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}