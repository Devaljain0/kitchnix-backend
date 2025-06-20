const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you have a database client set up in db.js
const jwt = require('jsonwebtoken');

// Place order for the user
router.post('/place', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer token
  if (!token) return res.status(401).json({ error: 'Authorization token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    const userEmail = decoded.email; // Extract the user email from the token
    const { orders } = req.body; // The orders should be sent in the body of the request

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'No orders provided' });
    }

    // Start a database transaction
    await db.query('BEGIN');

    for (const order of orders) {
      const { recipe_id, ingredients_added, ingredients_removed, order_cost } = order;

      // Insert into the userorder table
      const insertQuery = `
        INSERT INTO userorder (user_email, order_id, recipe_id, ingredient_add, ingredient_minus, order_cost)
        VALUES ($1, DEFAULT, $2, $3, $4, $5)
      `;
      
      const values = [
        userEmail,               // user_email
        recipe_id,               // recipe_id
        ingredients_added || '{}',  // ingredient_add (convert to empty array if null)
        ingredients_removed || '{}', // ingredient_minus (convert to empty array if null)
        order_cost               // order_cost
      ];

      await db.query(insertQuery, values);
    }

    // Commit the transaction after all inserts
    await db.query('COMMIT');

    res.status(200).json({ message: 'Order placed successfully!' });
  } catch (error) {
    // Rollback transaction in case of error
    await db.query('ROLLBACK');
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Error placing order' });
  }
});

module.exports = router;
