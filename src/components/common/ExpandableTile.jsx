"use client";

import { useState } from 'react';

export const ExpandableTile = ({ title, defaultOpen = false, children, actionButton }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden transition-all duration-300">
      {/* Tile Header (Clickable) */}
      <div 
        className="flex justify-between items-center p-6 lg:p-8 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold uppercase tracking-widest text-black dark:text-white">
          {title}
        </h2>
        <div className="flex items-center gap-4">
          {/* Optional Action Button (e.g., "Add Client" or the "Radio" circle from your wireframe) */}
          {actionButton && (
            <div onClick={(e) => e.stopPropagation()}>
              {actionButton}
            </div>
          )}
          
          {/* Chevron Icon that rotates when open */}
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content Area */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-6 lg:p-8 pt-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0F172A] m-2 rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};