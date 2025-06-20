const express = require('express');
const router = express.Router();
const client = require('../db'); // Import the client from db.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and extract user email
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log(token); // Bearer token
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// Fetch cart items for a user
router.get('/:email', authenticateToken, async (req, res) => {
  const { email } = req.params;

  try {
    const query = 'SELECT c.recipe_id, c.quantity, r.recipe_cost, r.recipe_imgurl  FROM cart c JOIN recipe r ON c.recipe_id = r.recipe_id WHERE c.user_email = $1';
    const { rows } = await client.query(query, [email]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  const { recipe_id, quantity } = req.body;
  const user_email = req.user.email; // Get email from verified token

  try {
    const query = 'INSERT INTO cart (user_email, recipe_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_email, recipe_id) DO UPDATE SET quantity = cart.quantity + $3';
    await client.query(query, [user_email, recipe_id, quantity]);
    res.status(201).json({ message: 'Item added to cart successfully.' });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove item from cart
router.delete('/remove/:email/:recipe_id', authenticateToken, async (req, res) => {
  const { email, recipe_id } = req.params;

  try {
    const query = 'DELETE FROM cart WHERE user_email = $1 AND recipe_id = $2';
    await client.query(query, [email, recipe_id]);
    res.json({ message: 'Item removed from cart successfully.' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Place order
router.post('/place-order', authenticateToken, async (req, res) => {
  const { ingredientsAdded, ingredientsRemoved, orderCost } = req.body;
  const user_email = req.user.email; // Get email from verified token

  try {
    // Fetch items from cart
    const cartQuery = 'SELECT recipe_id, cart_quantity FROM cart WHERE user_email = $1';
    const { rows: cartItems } = await client.query(cartQuery, [user_email]);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Insert each item into userorder table
    for (const item of cartItems) {
      const orderQuery = 'INSERT INTO userorder (user_email, recipe_id, ingredient_add, ingredient_minus, order_cost) VALUES ($1, $2, $3, $4, $5)';
      await client.query(orderQuery, [user_email, item.recipe_id, ingredientsAdded, ingredientsRemoved, orderCost]);
    }

    // Clear the cart after placing the order
    const deleteCartQuery = 'DELETE FROM cart WHERE user_email = $1';
    await client.query(deleteCartQuery, [user_email]);

    res.status(201).json({ message: 'Order placed successfully.' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
