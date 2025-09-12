import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 rounded-xl transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 ${
        isDark 
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400 border border-gray-600' 
          : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
      } ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-6 w-6" />
      ) : (
        <Moon className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggle; 