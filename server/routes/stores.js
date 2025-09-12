const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireUser } = require('../middleware/auth');

const router = express.Router();

// Get all stores with ratings
router.get('/', authenticateToken, requireUser, async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        CAST(CASE 
          WHEN COUNT(r.id) > 0 THEN ROUND(AVG(r.rating), 2)
          ELSE 0
        END AS DECIMAL(3,2)) as average_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
    `;

    const queryParams = [userId];

    // Add search functionality
    if (search) {
      query += ' WHERE s.name LIKE ? OR s.address LIKE ?';
      queryParams.push(`%${search}%`);
      queryParams.push(`%${search}%`);
    }

    query += ' GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating';

    // Add sorting
    const validSortFields = ['name', 'email', 'address', 'created_at', 'average_rating', 'total_ratings'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY s.name ASC';
    }

    const [result] = await pool.execute(query, queryParams);

    res.json({ 
      stores: result,
      total: result.length
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
});

// Get store owner's stores information
router.get('/my-store', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a store owner
    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Access denied. Only store owners can access this endpoint.' });
    }

    const query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        CAST(CASE 
          WHEN COUNT(r.id) > 0 THEN ROUND(AVG(r.rating), 2)
          ELSE 0
        END AS DECIMAL(3,2)) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id, s.name, s.email, s.address, s.created_at
      ORDER BY s.created_at DESC
    `;

    const [result] = await pool.execute(query, [userId]);

    if (result.length === 0) {
      return res.json({ stores: [] });
    }

    res.json({ stores: result });
  } catch (error) {
    console.error('Get my stores error:', error);
    res.status(500).json({ error: 'Failed to get store information' });
  }
});

// Get specific store details
router.get('/:id', authenticateToken, requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        CAST(CASE 
          WHEN COUNT(r.id) > 0 THEN ROUND(AVG(r.rating), 2)
          ELSE 0
        END AS DECIMAL(3,2)) as average_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      WHERE s.id = ?
      GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating
    `;

    const [result] = await pool.execute(query, [userId, id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ store: result[0] });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to get store' });
  }
});

// Search stores by name and address
router.get('/search', authenticateToken, requireUser, async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        CAST(CASE 
          WHEN COUNT(r.id) > 0 THEN ROUND(AVG(r.rating), 2)
          ELSE 0
        END AS DECIMAL(3,2)) as average_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
    `;

    const queryParams = [userId];
    const conditions = [];

    if (name) {
      conditions.push('s.name LIKE ?');
      queryParams.push(`%${name}%`);
    }

    if (address) {
      conditions.push('s.address LIKE ?');
      queryParams.push(`%${address}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating';

    // Add sorting
    const validSortFields = ['name', 'email', 'address', 'created_at', 'average_rating', 'total_ratings'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY s.name ASC';
    }

    const [result] = await pool.execute(query, queryParams);

    res.json({ 
      stores: result,
      total: result.length
    });
  } catch (error) {
    console.error('Search stores error:', error);
    res.status(500).json({ error: 'Failed to search stores' });
  }
});

// Update store (store owner can only update their own store)
router.put('/my-store/:id', authenticateToken, requireUser, async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const { id: storeId } = req.params;
    const userId = req.user.id;

    // Check if user is a store owner
    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Only store owners can update store information' });
    }

    // Verify the store belongs to this user
    const [storeResult] = await pool.execute(
      'SELECT id, name, email FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, userId]
    );

    if (storeResult.length === 0) {
      return res.status(404).json({ error: 'Store not found or you do not have permission to update it' });
    }

    const store = storeResult[0];

    // Check if email is already taken by another store (excluding current store)
    const [existingStore] = await pool.execute(
      'SELECT id FROM stores WHERE email = ? AND id != ?',
      [email, store.id]
    );

    if (existingStore.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // Update store
    await pool.execute(
      'UPDATE stores SET name = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, address, store.id]
    );

    // Get the updated store with ratings
    const [updatedStore] = await pool.execute(
      `SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        CASE 
          WHEN COUNT(r.id) > 0 THEN ROUND(AVG(r.rating), 2)
          ELSE 0
        END as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id, s.name, s.email, s.address, s.created_at`,
      [store.id]
    );

    res.json({
      message: 'Store updated successfully',
      store: updatedStore[0]
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// Legacy endpoint for backward compatibility (updates first store)
router.put('/my-store', authenticateToken, requireUser, async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const userId = req.user.id;

    // Check if user is a store owner
    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Only store owners can update store information' });
    }

    // Get the first store owned by this user
    const [storeResult] = await pool.execute(
      'SELECT id, name, email FROM stores WHERE owner_id = ? ORDER BY created_at ASC LIMIT 1',
      [userId]
    );

    if (storeResult.length === 0) {
      return res.status(404).json({ error: 'No store found for this account' });
    }

    const store = storeResult[0];

    // Check if email is already taken by another store (excluding current store)
    const [existingStore] = await pool.execute(
      'SELECT id FROM stores WHERE email = ? AND id != ?',
      [email, store.id]
    );

    if (existingStore.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // Update store
    await pool.execute(
      'UPDATE stores SET name = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, address, store.id]
    );

    // Get the updated store with ratings
    const [updatedStore] = await pool.execute(
      `SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        CASE 
          WHEN COUNT(r.id) > 0 THEN ROUND(AVG(r.rating), 2)
          ELSE 0
        END as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id, s.name, s.email, s.address, s.created_at`,
      [store.id]
    );

    res.json({
      message: 'Store updated successfully',
      store: updatedStore[0]
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

module.exports = router; 