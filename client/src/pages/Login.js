import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { Eye, EyeOff, Mail, Lock, Store } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Ensure theme is properly applied
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    await login(data.email, data.password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 bg-blue-400 dark:bg-blue-500 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 bg-purple-400 dark:bg-purple-500 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 bg-indigo-400 dark:bg-indigo-500 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
                         <div className="flex justify-center items-center mb-6">
               <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 shadow-lg dark:shadow-blue-500/25">
                 <Store className="h-8 w-8 text-white" />
               </div>
             </div>
             
             {/* Main Heading */}
             <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
               Store Rating System
             </h1>
             
             {/* Subtitle */}
             <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-6">
               Rate, Review & Discover Amazing Stores
             </p>
          </div>

                     {/* Login Form Card */}
           <div className="backdrop-blur-lg rounded-2xl shadow-2xl bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 p-8">
             <div className="text-center mb-6">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                 Welcome Back
               </h2>
               <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                 Sign in to access your account
               </p>
             </div>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                             {/* Email Field */}
               <div>
                 <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                   Email Address
                 </label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                     <Mail className="h-5 w-5" />
                   </div>
                   <input
                     id="email"
                     type="email"
                     autoComplete="email"
                     className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                     placeholder="Enter your email"
                     {...register('email', {
                       required: 'Email is required',
                       pattern: {
                         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                         message: 'Invalid email address',
                       },
                     })}
                   />
                 </div>
                 {errors.email && (
                   <p className="text-red-500 text-sm mt-1 flex items-center">
                     <span className="mr-1">⚠</span>
                     {errors.email.message}
                   </p>
                 )}
               </div>

               {/* Password Field */}
               <div>
                 <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                   Password
                 </label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                     <Lock className="h-5 w-5" />
                   </div>
                   <input
                     id="password"
                     type={showPassword ? 'text' : 'password'}
                     autoComplete="current-password"
                     className="w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                     placeholder="Enter your password"
                     {...register('password', {
                       required: 'Password is required',
                     })}
                   />
                   <button
                     type="button"
                     className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                     onClick={() => setShowPassword(!showPassword)}
                   >
                     {showPassword ? (
                       <EyeOff className="h-5 w-5" />
                     ) : (
                       <Eye className="h-5 w-5" />
                     )}
                   </button>
                 </div>
                 {errors.password && (
                   <p className="text-red-500 text-sm mt-1 flex items-center">
                     <span className="mr-1">⚠</span>
                     {errors.password.message}
                   </p>
                 )}
               </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

                         {/* Register Link */}
             <div className="text-center mt-6">
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 Don't have an account?{' '}
                 <Link
                   to="/register"
                   className="font-semibold text-blue-500 hover:text-blue-400 transition-colors duration-200"
                 >
                   Create one now
                 </Link>
               </p>
             </div>

             {/* Demo Account Info */}
             <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
               <p className="text-sm font-semibold text-center mb-2 text-gray-700 dark:text-gray-200">
                 🚀 Demo Admin Account
               </p>
               <div className="text-xs text-center space-y-1 text-gray-600 dark:text-gray-400">
                 <p>Email: <span className="font-mono">admin@store-rating.com</span></p>
                 <p>Password: <span className="font-mono">Admin@123</span></p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 