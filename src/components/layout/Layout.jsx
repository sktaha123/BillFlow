import React from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient background glow inspired by micro1 */}
      <div className="ambient-glow" />

      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
        {children}
      </main>
    </div>
  );
};
