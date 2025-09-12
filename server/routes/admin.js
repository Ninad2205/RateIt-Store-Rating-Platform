const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUserRegistration, validateStoreCreation } = require('../middleware/validation');

const router = express.Router();

// Admin dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users count
    const [usersResult] = await pool.execute('SELECT COUNT(*) as total_users FROM users');
    
    // Get total stores count
    const [storesResult] = await pool.execute('SELECT COUNT(*) as total_stores FROM stores');
    
    // Get total ratings count
    const [ratingsResult] = await pool.execute('SELECT COUNT(*) as total_ratings FROM ratings');

    res.json({
      totalUsers: parseInt(usersResult[0].total_users),
      totalStores: parseInt(storesResult[0].total_stores),
      totalRatings: parseInt(ratingsResult[0].total_ratings)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get all users with filtering and sorting
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      search, 
      role, 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        CASE 
          WHEN u.role = 'store_owner' THEN ROUND(AVG(r.rating), 2)
          ELSE NULL
        END as average_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
    `;

    const queryParams = [];
    const conditions = [];

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)');
      queryParams.push(`%${search}%`);
      queryParams.push(`%${search}%`);
      queryParams.push(`%${search}%`);
    }

    if (role) {
      conditions.push('u.role = ?');
      queryParams.push(role);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at';

    // Add sorting
    const validSortFields = ['name', 'email', 'address', 'role', 'created_at', 'average_rating'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY u.name ASC';
    }

    const [result] = await pool.execute(query, queryParams);

    res.json({ 
      users: result,
      total: result.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user details by ID
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        CASE 
          WHEN u.role = 'store_owner' THEN ROUND(AVG(r.rating), 2)
          ELSE NULL
        END as average_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = ?
      GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at
    `, [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [userResult] = await pool.execute(
      'SELECT id, name, role FROM users WHERE id = ?',
      [id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    // Prevent users from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const [adminCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
      );
      
      if (adminCount[0].count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // Check if user owns any stores
    const [storeResult] = await pool.execute(
      'SELECT id FROM stores WHERE owner_id = ?',
      [id]
    );

    if (storeResult.length > 0) {
      return res.status(400).json({ error: 'Cannot delete user who owns stores. Please delete their stores first.' });
    }

    // Delete user's ratings
    await pool.execute('DELETE FROM ratings WHERE user_id = ?', [id]);

    // Delete user
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Create new user (admin only)
router.post('/users', authenticateToken, requireAdmin, validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate role
    const validRoles = ['admin', 'user', 'store_owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, address, role]
    );

    // Get the created user
    const [userResult] = await pool.execute(
      'SELECT id, name, email, role, address FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = userResult[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all stores with filtering and sorting
router.get('/stores', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      search, 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = req.query;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        u.name as owner_name,
        u.email as owner_email,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const queryParams = [];
    let whereClause = '';

    if (search) {
      whereClause = 'WHERE s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ? OR u.name LIKE ?';
      queryParams.push(`%${search}%`);
      queryParams.push(`%${search}%`);
      queryParams.push(`%${search}%`);
      queryParams.push(`%${search}%`);
    }

    query += whereClause + ' GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.name, u.email';

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

// Delete store (admin only)
router.delete('/stores/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if store exists
    const [storeResult] = await pool.execute(
      'SELECT id, name FROM stores WHERE id = ?',
      [id]
    );

    if (storeResult.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Delete store's ratings first
    await pool.execute('DELETE FROM ratings WHERE store_id = ?', [id]);

    // Delete store
    await pool.execute('DELETE FROM stores WHERE id = ?', [id]);

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

// Create new store
router.post('/stores', authenticateToken, requireAdmin, validateStoreCreation, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store email already exists
    const [existingStore] = await pool.execute(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (existingStore.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // Check if owner exists and is a store owner
    if (ownerId) {
      const [ownerResult] = await pool.execute(
        'SELECT id, role FROM users WHERE id = ?',
        [ownerId]
      );

      if (ownerResult.length === 0) {
        return res.status(400).json({ error: 'Owner not found' });
      }

      if (ownerResult[0].role !== 'store_owner') {
        return res.status(400).json({ error: 'Owner must be a store owner' });
      }
    }

    // Create store
    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId || null]
    );

    // Get the created store
    const [storeResult] = await pool.execute(
      'SELECT id, name, email, address FROM stores WHERE id = ?',
      [result.insertId]
    );

    const store = storeResult[0];

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address
      }
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Update store (admin only)
router.put('/stores/:id', authenticateToken, requireAdmin, validateStoreCreation, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId } = req.body;

    // Check if store exists
    const [storeResult] = await pool.execute(
      'SELECT id, name, email FROM stores WHERE id = ?',
      [id]
    );

    if (storeResult.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if email is already taken by another store
    const [existingStore] = await pool.execute(
      'SELECT id FROM stores WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existingStore.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // Check if owner exists and is a store owner
    if (ownerId) {
      const [ownerResult] = await pool.execute(
        'SELECT id, role FROM users WHERE id = ?',
        [ownerId]
      );

      if (ownerResult.length === 0) {
        return res.status(400).json({ error: 'Owner not found' });
      }

      if (ownerResult[0].role !== 'store_owner') {
        return res.status(400).json({ error: 'Owner must be a store owner' });
      }
    }

    // Update store
    await pool.execute(
      'UPDATE stores SET name = ?, email = ?, address = ?, owner_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, address, ownerId || null, id]
    );

    // Get the updated store
    const [updatedStore] = await pool.execute(
      'SELECT id, name, email, address FROM stores WHERE id = ?',
      [id]
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