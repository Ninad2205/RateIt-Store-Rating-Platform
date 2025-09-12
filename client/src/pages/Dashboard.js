import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Store, 
  Star, 
  BarChart3, 
  Users, 
  Settings,
  Mail,
  MapPin
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin, isStoreOwner, isNormalUser } = useAuth();

  const getWelcomeMessage = () => {
    if (isAdmin) return 'System Administrator Dashboard';
    if (isStoreOwner) return 'Store Owner Dashboard';
    return 'Welcome to Store Rating System';
  };

  const getRoleDescription = () => {
    if (isAdmin) {
      return 'Manage users, stores, and view system statistics.';
    }
    if (isStoreOwner) {
      return 'View your store ratings and manage your store information.';
    }
    return 'Browse stores, submit ratings, and manage your profile.';
  };

  const getQuickActions = () => {
    if (isAdmin) {
      return [
        { name: 'View Users', href: '/admin/users', icon: Users, color: 'bg-blue-500' },
        { name: 'Manage Stores', href: '/admin/stores', icon: Store, color: 'bg-green-500' },
        { name: 'System Stats', href: '/admin', icon: BarChart3, color: 'bg-purple-500' },
      ];
    }
    if (isStoreOwner) {
      return [
        { name: 'Store Dashboard', href: '/store-owner', icon: BarChart3, color: 'bg-purple-500' },
        { name: 'View Stores', href: '/stores', icon: Store, color: 'bg-green-500' },
        { name: 'Profile Settings', href: '/profile', icon: Settings, color: 'bg-gray-500' },
      ];
    }
    return [
      { name: 'Browse Stores', href: '/stores', icon: Store, color: 'bg-green-500' },
      { name: 'Profile Settings', href: '/profile', icon: Settings, color: 'bg-gray-500' },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
            <p className="text-gray-600">{getRoleDescription()}</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-sm text-gray-900">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-sm text-gray-900">{user?.address}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Star className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-sm text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getQuickActions().map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{action.name}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Role-specific content */}
      {isNormalUser && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Browse Stores</p>
                <p className="text-sm text-gray-600">Explore all registered stores and their ratings</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Submit Ratings</p>
                <p className="text-sm text-gray-600">Rate stores from 1 to 5 stars based on your experience</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Profile</p>
                <p className="text-sm text-gray-600">Update your information and change your password</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrative Functions</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">User Management</p>
                <p className="text-sm text-gray-600">Add, view, and manage all users in the system</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Store className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Store Management</p>
                <p className="text-sm text-gray-600">Add new stores and manage existing ones</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">System Analytics</p>
                <p className="text-sm text-gray-600">View system statistics and performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStoreOwner && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Owner Features</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Store Analytics</p>
                <p className="text-sm text-gray-600">View your store's ratings and customer feedback</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Rating Overview</p>
                <p className="text-sm text-gray-600">See average ratings and individual customer reviews</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Customer Insights</p>
                <p className="text-sm text-gray-600">View details of customers who rated your store</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 