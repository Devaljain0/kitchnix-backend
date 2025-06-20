const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// 🔒 Middleware for verifying JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authorization token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// 📥 GET User Profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log(userEmail);
    const result = await db.query(
      `SELECT user_name, user_email, user_phn_no, user_address 
       FROM useraccount 
       WHERE user_email = $1`,
      [userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.status(200).json({
      name: user.user_name,
      email: user.user_email,
      phone: user.user_phn_no,
      address: user.user_address
    });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ✏️ UPDATE User Profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { name, phone, address } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ error: 'Name, phone, and address are required' });
    }

    await db.query(
      `UPDATE useraccount 
       SET user_name = $1, user_phn_no = $2, user_address = $3 
       WHERE user_email = $4`,
      [name, phone, address, userEmail]
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
// 📦 GET User Orders
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await db.query(
      `SELECT *
       FROM userorder
       WHERE user_email = $1`,
      [userEmail]
    );

    res.status(200).json({ orders: result.rows });
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
