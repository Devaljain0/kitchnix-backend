const express = require('express');
const router = express.Router();
const client = require('../db'); // Ensure this imports your database client

// Middleware for admin authentication (if needed)
const adminAuth = (req, res, next) => {
  // Your authentication logic (if any)
  next(); // Call next() to proceed to the next middleware or route handler
};

// Route to get all recipes
router.get('/recipes', adminAuth, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM recipe'); // Adjust the SQL query if necessary
    res.json(result.rows); // Return the fetched recipes as JSON
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' }); // Handle errors appropriately
  }
});

// Export the router
module.exports = router;
