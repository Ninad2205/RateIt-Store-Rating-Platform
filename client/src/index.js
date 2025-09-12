import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Suppress ResizeObserver loop error warning in development
if (typeof window !== 'undefined') {
  // Override console methods to filter out ResizeObserver errors
  const originalError = window.console.error;
  const originalWarn = window.console.warn;
  
  window.console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return;
    }
    originalError.apply(window.console, args);
  };
  
  window.console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return;
    }
    originalWarn.apply(window.console, args);
  };
  
  // Also handle unhandled promise rejections that might contain ResizeObserver errors
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string' && event.reason.includes('ResizeObserver')) {
      event.preventDefault();
    }
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      event.preventDefault();
      return false;
    }
  });
  
  // Additional ResizeObserver error suppression
  const originalResizeObserver = window.ResizeObserver;
  if (originalResizeObserver) {
    window.ResizeObserver = class extends originalResizeObserver {
      constructor(callback) {
        super((entries, observer) => {
          try {
            callback(entries, observer);
          } catch (error) {
            if (error.message && error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
              // Suppress this specific error
              return;
            }
            throw error;
          }
        });
      }
    };
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 