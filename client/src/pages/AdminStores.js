import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Store, Search, Mail, MapPin, User, Star, Calendar, Plus, X, Trash2, Edit } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import useDebounce from '../hooks/useDebounce';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [storeOwners, setStoreOwners] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Debounce search term to prevent API calls on every character
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`/api/admin/stores?${params}`);
      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  const fetchStoreOwners = async () => {
    try {
      const response = await axios.get('/api/admin/users?role=store_owner');
      setStoreOwners(response.data.users);
    } catch (error) {
      console.error('Error fetching store owners:', error);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, [fetchStores]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Store name is required';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.address || formData.address.length > 400) {
      errors.address = 'Address must not exceed 400 characters';
    }
    
    if (!formData.ownerId) {
      errors.ownerId = 'Please select a store owner';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('/api/admin/stores', formData);
      
      toast.success('Store created successfully!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (error) {
      console.error('Store creation error:', error.response?.data);
      const message = error.response?.data?.error || 'Failed to create store';
      toast.error(message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setEditFormData({
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.owner_id || ''
    });
    setEditFormErrors({});
    setShowEditModal(true);
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
    
    if (!editFormData.ownerId) {
      errors.ownerId = 'Please select a store owner';
    }
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    try {
      setEditLoading(true);
      await axios.put(`/api/admin/stores/${editingStore.id}`, editFormData);
      
      toast.success('Store updated successfully!');
      setShowEditModal(false);
      setEditingStore(null);
      setEditFormData({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (error) {
      console.error('Store update error:', error.response?.data);
      const message = error.response?.data?.error || 'Failed to update store';
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteStore = async (storeId, storeName) => {
    if (!window.confirm(`Are you sure you want to delete store "${storeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [storeId]: true }));
      await axios.delete(`/api/admin/stores/${storeId}`);
      toast.success('Store deleted successfully!');
      fetchStores();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete store';
      toast.error(message);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [storeId]: false }));
    }
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
              <p className="text-gray-600">View and manage all stores in the system</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="email">Sort by Email</option>
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
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{store.email}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{store.address}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">Joined {formatDate(store.created_at)}</p>
                </div>
              </div>

              {/* Owner Information */}
              {store.owner_name && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Owner</p>
                      <p className="text-sm text-gray-600">{store.owner_name}</p>
                      <p className="text-xs text-gray-500">{store.owner_email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating Information */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Rating</span>
                  <span className="text-sm text-gray-600">
                    {store.average_rating ? parseFloat(store.average_rating).toFixed(1) : '0.0'}/5
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(parseFloat(store.average_rating) || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({store.total_ratings || 0} rating{(store.total_ratings || 0) !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 space-y-2">
                <button
                  onClick={() => handleEditStore(store)}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                  title="Edit store"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Store</span>
                </button>
                <button
                  onClick={() => handleDeleteStore(store.id, store.name)}
                  disabled={deleteLoading[store.id]}
                  className="w-full btn-danger flex items-center justify-center space-x-2"
                  title="Delete store"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Store</span>
                </button>
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

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Store</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="Enter store name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Store Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="Enter store email address"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Store Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="input-field mt-1"
                  placeholder="Enter store address (max 400 characters)"
                />
                {formErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                )}
              </div>

              <div>
                <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700">
                  Store Owner
                </label>
                <select
                  id="ownerId"
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                >
                  <option value="">Select a store owner</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                {formErrors.ownerId && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.ownerId}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Create Store
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Store</h3>
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

              <div>
                <label htmlFor="edit-ownerId" className="block text-sm font-medium text-gray-700">
                  Store Owner
                </label>
                <select
                  id="edit-ownerId"
                  name="ownerId"
                  value={editFormData.ownerId}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                >
                  <option value="">Select a store owner</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                {editFormErrors.ownerId && (
                  <p className="text-red-500 text-xs mt-1">{editFormErrors.ownerId}</p>
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

export default AdminStores; 