'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-gradient-to-r from-teal-600 to-emerald-700 shadow-xl py-2' : 'bg-gradient-to-r from-teal-500 to-emerald-600 py-3'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 group">
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-coral-400 group-hover:from-coral-400 group-hover:to-amber-300 transition-all duration-500">
                Bijayakumartamang
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              <NavLink href="/" text="Home" />
              <NavLink href="/about" text="About" />
              <NavLink href="/ytshorts" text="YT Shorts" />
              <NavLink href="/projects" text="Projects" />
              <NavLink href="/contact" text="Contact" />
              <button className="ml-4 px-4 py-2 rounded-full bg-gradient-to-r from-coral-400 to-amber-400 text-teal-900 font-bold text-sm hover:shadow-lg hover:shadow-amber-300/30 transition-all duration-300 transform hover:scale-105">
                Get Started
              </button>
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400 transition-all duration-300"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gradient-to-b from-teal-600 to-emerald-700 shadow-inner">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <MobileNavLink href="/" text="Home" />
            <MobileNavLink href="/about" text="About" />
            <MobileNavLink href="/ytshorts" text="YT Shorts Downloader" />
            <MobileNavLink href="/projects" text="Projects" />
            <MobileNavLink href="/contact" text="Contact" />
            <div className="mt-4 px-3">
              <button className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-coral-400 to-amber-400 text-teal-900 font-bold text-sm hover:shadow-lg hover:shadow-amber-300/30 transition-all duration-300">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, text }) {
  return (
    <Link href={href} className="relative text-white hover:text-amber-300 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 group">
      {text}
      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-0 bg-coral-400 group-hover:w-3/4 transition-all duration-300"></span>
    </Link>
  );
}

function MobileNavLink({ href, text }) {
  return (
    <Link href={href} className="text-white hover:bg-emerald-700/30 hover:text-amber-300 block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 border-l-4 border-transparent hover:border-coral-400 pl-4">
      {text}
    </Link>
  );
}