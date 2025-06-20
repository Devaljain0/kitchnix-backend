const express = require('express');
const router = express.Router();
const client = require('../db'); // Import the client from db.js
const jwt = require('jsonwebtoken');

// Add a new ingredient
router.post('/ingredients', async (req, res) => {
  const { ingredient_name, available_quantity, ingredient_cost } = req.body;
  
  try {
    const query = 'INSERT INTO inventory (ingredient_name, available_quantity, ingredient_cost) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(query, [ingredient_name, available_quantity, ingredient_cost]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding ingredient:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all ingredients
router.get('/ingredients', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM inventory ORDER BY ingredient_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update an ingredient
router.put('/ingredients/:id', async (req, res) => {
  const { id } = req.params;
  const { ingredient_name, available_quantity, ingredient_cost } = req.body;
  
  try {
    const query = 'UPDATE inventory SET ingredient_name = $1, available_quantity = $2, ingredient_cost = $3 WHERE ingredient_id = $4 RETURNING *';
    const result = await client.query(query, [ingredient_name, available_quantity, ingredient_cost, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete an ingredient
router.delete('/ingredients/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = 'DELETE FROM inventory WHERE ingredient_id = $1 RETURNING *';
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
