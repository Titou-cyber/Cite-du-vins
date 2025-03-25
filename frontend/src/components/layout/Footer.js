import Link from 'next/link';
import Image from 'next/image';
import { Wine, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-wine-burgundy text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center mb-4">
              <Wine className="h-8 w-8 text-wine-gold" />
              <span className="ml-2 text-xl font-bold font-serif text-white">Terroir</span>
            </div>
            <p className="text-white/80 mb-6">
              An immersive wine experience platform created for La Cité Du Vin, designed to educate, engage, and inspire wine lovers around the world.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/70 hover:text-wine-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/70 hover:text-wine-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white/70 hover:text-wine-gold transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/map" className="text-white/70 hover:text-wine-gold transition-colors">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link href="/sommelier" className="text-white/70 hover:text-wine-gold transition-colors">
                  AI Sommelier
                </Link>
              </li>
              <li>
                <Link href="/tastings" className="text-white/70 hover:text-wine-gold transition-colors">
                  Virtual Tastings
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-white/70 hover:text-wine-gold transition-colors">
                  Wine Knowledge
                </Link>
              </li>
              <li>
                <Link href="/wines" className="text-white/70 hover:text-wine-gold transition-colors">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/70 hover:text-wine-gold transition-colors">
                  About La Cité Du Vin
                </Link>
              </li>
              <li>
                <Link href="/about/project" className="text-white/70 hover:text-wine-gold transition-colors">
                  About Terroir
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/70 hover:text-wine-gold transition-colors">
                  Wine Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-white/70 hover:text-wine-gold transition-colors">
                  Press & Media
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-wine-gold transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 text-wine-gold flex-shrink-0 mt-1" />
                <span className="text-white/70">
                  La Cité du Vin, 134 Quai de Bacalan, 33300 Bordeaux, France
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-wine-gold flex-shrink-0" />
                <span className="text-white/70">+33 (0)5 56 16 20 20</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-wine-gold flex-shrink-0" />
                <a href="mailto:contact@terroir-citeduvin.com" className="text-white/70 hover:text-wine-gold transition-colors">
                  contact@terroir-citeduvin.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Terroir - La Cité Du Vin. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-wine-gold transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-wine-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-wine-gold transition-colors">
              Cookie Policy
            </Link>
            <Link href="/accessibility" className="hover:text-wine-gold transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;