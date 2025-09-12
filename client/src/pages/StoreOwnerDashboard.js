import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Store, 
  Star, 
  Users, 
  Mail, 
  MapPin, 
  Calendar,
  TrendingUp,
  Edit,
  X,
  Plus,
  Building2
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const StoreOwnerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeRatings, setStoreRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchStoresData();
  }, []);

  const fetchStoresData = async () => {
    try {
      setLoading(true);
      
      // Fetch store owner's stores information
      const response = await axios.get('/api/stores/my-store');
      const storesData = response.data.stores;
      
      if (storesData && storesData.length > 0) {
        setStores(storesData);
        // Select the first store by default
        setSelectedStore(storesData[0]);
        // Fetch ratings for the first store
        await fetchStoreRatings(storesData[0].id);
      } else {
        setStores([]);
        setSelectedStore(null);
        setStoreRatings([]);
      }
    } catch (error) {
      console.error('Error fetching stores data:', error);
      toast.error('Failed to fetch stores data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreRatings = async (storeId) => {
    try {
      const ratingsResponse = await axios.get(`/api/ratings/store/${storeId}`);
      setStoreRatings(ratingsResponse.data.ratings);
    } catch (error) {
      console.error('Error fetching store ratings:', error);
      setStoreRatings([]);
    }
  };

  const handleStoreSelect = async (store) => {
    setSelectedStore(store);
    await fetchStoreRatings(store.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleEditStore = () => {
    setEditFormData({
      name: selectedStore.name,
      email: selectedStore.email,
      address: selectedStore.address
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (!editFormData.name || editFormData.name.trim().length === 0) {
      errors.name = 'Store name is required';
    }
    
    if (!editFormData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!editFormData.address || editFormData.address.length > 400) {
      errors.address = 'Address must not exceed 400 characters';
    }
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    if (!selectedStore) {
      toast.error('No store selected');
      return;
    }

    try {
      setEditLoading(true);
      await axios.put(`/api/stores/my-store/${selectedStore.id}`, editFormData);
      
      toast.success('Store updated successfully!');
      setShowEditModal(false);
      fetchStoresData(); // Refresh stores data
    } catch (error) {
      console.error('Store update error:', error.response?.data);
      const message = error.response?.data?.error || 'Failed to update store';
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  if (stores.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Stores Found</h3>
          <p className="text-gray-600">You don't have any stores associated with your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Stores Dashboard</h1>
            <p className="text-gray-600">Manage and monitor all your stores' performance</p>
          </div>
        </div>
      </div>

      {/* Store Selection Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Stores</h2>
        <div className="flex flex-wrap gap-2">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => handleStoreSelect(store)}
              className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                selectedStore?.id === store.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span className="font-medium">{store.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {store.total_ratings || 0} ratings
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedStore && (
        <>
          {/* Selected Store Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
              <button
                onClick={handleEditStore}
                className="btn-secondary flex items-center space-x-2"
                title="Edit store information"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Store</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedStore.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{selectedStore.email}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{selectedStore.address}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Rating</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {selectedStore.average_rating && selectedStore.average_rating > 0 ? parseFloat(selectedStore.average_rating).toFixed(1) : '0.0'}/5
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-2 mb-2">
                  {renderStars(selectedStore.average_rating && selectedStore.average_rating > 0 ? Math.round(parseFloat(selectedStore.average_rating)) : 0)}
                </div>
                <p className="text-sm text-gray-500">
                  {selectedStore.total_ratings || 0} rating{(selectedStore.total_ratings || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedStore?.average_rating && selectedStore.average_rating > 0 ? parseFloat(selectedStore.average_rating).toFixed(1) : '0.0'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedStore?.total_ratings || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Performance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedStore?.average_rating && parseFloat(selectedStore.average_rating) >= 4 ? 'Excellent' : 
                     selectedStore?.average_rating && parseFloat(selectedStore.average_rating) >= 3 ? 'Good' : 
                     selectedStore?.average_rating && parseFloat(selectedStore.average_rating) >= 2 ? 'Fair' : 'Poor'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Ratings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Customer Ratings</h2>
            {storeRatings.length > 0 ? (
              <div className="space-y-4">
                {storeRatings.map((rating) => (
                  <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {rating.user_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{rating.user_name}</p>
                            <p className="text-xs text-gray-500">{rating.user_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{rating.user_address}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-500">{formatDate(rating.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {renderStars(rating.rating)}
                          <span className="text-sm font-medium text-gray-900">{rating.rating}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings yet</h3>
                <p className="text-gray-600">This store hasn't received any ratings yet.</p>
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Rating Distribution</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = storeRatings.filter(r => r.rating === stars).length;
                    const percentage = storeRatings.length > 0 ? Math.round((count / storeRatings.length) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{stars} Star{stars !== 1 ? 's' : ''}</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-medium text-green-600">
                      {selectedStore?.average_rating && parseFloat(selectedStore.average_rating) >= 4 ? 'Excellent' : 
                       selectedStore?.average_rating && parseFloat(selectedStore.average_rating) >= 3 ? 'Good' : 
                       selectedStore?.average_rating && parseFloat(selectedStore.average_rating) >= 2 ? 'Fair' : 'Poor'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-medium text-blue-600">{selectedStore?.total_ratings || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-medium">
                      {selectedStore?.average_rating && selectedStore.average_rating > 0 ? parseFloat(selectedStore.average_rating).toFixed(1) : '0.0'}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Store Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Store Information</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                  placeholder="Enter store name"
                />
                {editFormErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{editFormErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                  Store Email
                </label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                  placeholder="Enter store email address"
                />
                {editFormErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{editFormErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">
                  Store Address
                </label>
                <textarea
                  id="edit-address"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  rows="3"
                  className="input-field mt-1"
                  placeholder="Enter store address (max 400 characters)"
                />
                {editFormErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{editFormErrors.address}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn-primary flex-1"
                >
                  {editLoading ? 'Updating...' : 'Update Store'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard; 