const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database to ensure they still exist
    const [result] = await pool.execute(
      'SELECT id, name, email, role, address FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (result.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireAdmin = requireRole(['admin']);
const requireUser = requireRole(['user', 'admin', 'store_owner']);
const requireStoreOwner = requireRole(['store_owner', 'admin']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireUser,
  requireStoreOwner
}; 