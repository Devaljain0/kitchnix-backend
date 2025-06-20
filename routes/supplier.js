const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const SUPPLIER_USERNAME = "deval";
const SUPPLIER_PASSWORD= "password";

// Mock supplier data
const supplier = {
  username: SUPPLIER_USERNAME,
  password: bcrypt.hashSync(SUPPLIER_PASSWORD, 10), // Hashed password
};

// Login route
router.post('/supplier/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if username matches the supplier
  if (username !== supplier.username) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, supplier.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Generate token
  const token = jwt.sign({ username: supplier.username, role : "supplier"}, process.env.JWT_SECRET, { expiresIn: "1h"});

  res.json({ token, message: 'Login successful' });
});

module.exports = router;
