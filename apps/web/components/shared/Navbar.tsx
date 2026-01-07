'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-cream/90 dark:bg-stone-950/90 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center text-white">
              <MapPinIcon />
            </div>
            <span className="text-xl font-bold text-stone-900 dark:text-white">
              TravelMatch
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link href="#download" className="btn-primary text-sm py-3 px-6">
              Get the App
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-stone-900 dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cream dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 animate-fade-in-down">
          <div className="section-container py-6 space-y-4">
            <Link
              href="#features"
              className="block text-stone-600 dark:text-stone-400 py-2 hover:text-stone-900 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="block text-stone-600 dark:text-stone-400 py-2 hover:text-stone-900 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How it Works
            </Link>
            <Link
              href="#download"
              className="btn-primary w-full text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get the App
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
