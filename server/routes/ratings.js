const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateRatingSubmission } = require('../middleware/validation');

const router = express.Router();

// Submit or update rating for a store
router.post('/:storeId', authenticateToken, requireUser, validateRatingSubmission, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const [storeResult] = await pool.execute('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeResult.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user already rated this store
    const [existingRating] = await pool.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existingRating.length > 0) {
      // Update existing rating
      await pool.execute(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
    } else {
      // Create new rating
      await pool.execute(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get user's rating for a specific store
router.get('/:storeId', authenticateToken, requireUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (result.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: result[0].rating });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ error: 'Failed to get rating' });
  }
});

// Delete user's rating for a store
router.delete('/:storeId', authenticateToken, requireUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});

// Get all ratings for a specific store (for store owners)
router.get('/store/:storeId', authenticateToken, requireUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Check if user is the store owner
    const [storeResult] = await pool.execute(
      'SELECT owner_id FROM stores WHERE id = ?',
      [storeId]
    );

    if (storeResult.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (storeResult[0].owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only store owners and admins can view store ratings.' });
    }

    const query = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        u.name as user_name,
        u.email as user_email,
        u.address as user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `;

    const [result] = await pool.execute(query, [storeId]);

    res.json({ ratings: result });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ error: 'Failed to get store ratings' });
  }
});

module.exports = router; 