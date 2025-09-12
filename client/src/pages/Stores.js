import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Star, Search, MapPin, Mail, Calendar, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import useDebounce from '../hooks/useDebounce';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedRatings, setSelectedRatings] = useState({});
  const [ratingLoading, setRatingLoading] = useState({});

  // Debounce search term to prevent API calls on every character
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`/api/stores?${params}`);
      setStores(response.data.stores);
    } catch (error) {
      toast.error('Failed to fetch stores');
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      setRatingLoading(prev => ({ ...prev, [storeId]: true }));
      await axios.post(`/api/ratings/${storeId}`, { rating });
      toast.success('Rating submitted successfully!');
      // Clear the selected rating for this store
      setSelectedRatings(prev => ({ ...prev, [storeId]: null }));
      fetchStores(); // Refresh to get updated data
    } catch (error) {
      toast.error('Failed to submit rating');
      console.error('Error submitting rating:', error);
    } finally {
      setRatingLoading(prev => ({ ...prev, [storeId]: false }));
    }
  };

  const handleRatingDelete = async (storeId) => {
    try {
      setRatingLoading(prev => ({ ...prev, [storeId]: true }));
      await axios.delete(`/api/ratings/${storeId}`);
      toast.success('Rating removed successfully!');
      // Clear the selected rating for this store
      setSelectedRatings(prev => ({ ...prev, [storeId]: null }));
      fetchStores(); // Refresh to get updated data
    } catch (error) {
      toast.error('Failed to remove rating');
      console.error('Error removing rating:', error);
    } finally {
      setRatingLoading(prev => ({ ...prev, [storeId]: false }));
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'div'}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
            }`}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <p className="text-gray-600">Browse and rate stores in the system</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              </div>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="name">Sort by Name</option>
            <option value="average_rating">Sort by Rating</option>
            <option value="created_at">Sort by Date</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-field"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {stores.length} store{stores.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {/* Store Header */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{store.address}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{store.email}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">Joined {formatDate(store.created_at)}</p>
                </div>
              </div>

              {/* Rating Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                  <span className="text-sm text-gray-600">
                    {store.average_rating ? parseFloat(store.average_rating).toFixed(1) : '0.0'}/5
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  {renderStars(store.average_rating ? Math.round(parseFloat(store.average_rating)) : 0)}
                                      <span className="text-sm text-gray-500">
                      ({store.total_ratings || 0} rating{(store.total_ratings || 0) !== 1 ? 's' : ''})
                    </span>
                </div>

                {/* User's Rating */}
                {store.user_rating && parseFloat(store.user_rating) > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Your Rating</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(store.user_rating ? parseFloat(store.user_rating) : 0)}
                      <button
                        onClick={() => handleRatingDelete(store.id)}
                        disabled={ratingLoading[store.id]}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Rate Store */}
                <div>
                  <span className="text-sm font-medium text-gray-700">Rate this store</span>
                  <div className="mt-2">
                    {renderStars(selectedRatings[store.id] || 0, true, (rating) => {
                      setSelectedRatings(prev => ({ ...prev, [store.id]: rating }));
                      handleRatingSubmit(store.id, rating);
                    })}
                  </div>
                  {ratingLoading[store.id] && (
                    <div className="mt-2 text-sm text-gray-500">Submitting...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {stores.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search criteria.' : 'No stores are currently registered.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Stores; 