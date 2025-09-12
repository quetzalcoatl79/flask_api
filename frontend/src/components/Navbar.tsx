'use client';
// components/Navbar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-gray-800">
            flask app
          </Link>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-bold text-gray-800">
          flask app
        </Link>
        <div className="flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-blue-500">
            Accueil
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-500">
            À propos
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-blue-500">
            Contact
          </Link>
        </div>
        <div className="ml-4 relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            {isAuthenticated ? user?.username : 'Se connecter'}
            <svg
              className="-mr-1 ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;