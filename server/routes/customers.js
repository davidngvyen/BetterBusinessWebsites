const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// Helper function to get user's schema name
const getUserSchema = (email) => {
  return `user_${email.replace('@', '_at_').replace('.', '_dot_')}`;
};

// Get all customers
router.get('/', async (req, res) => {
  try {
    const schemaName = getUserSchema(req.user.email);
    const result = await pool.query(
      `SELECT * FROM ${schemaName}.customers ORDER BY fname`
    );
    console.log('Sending customers:', result.rows); // Debug log
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add new customer
router.post('/', async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const { fName, lName, pNum, price, style } = req.body;
    const schemaName = getUserSchema(req.user.email);

    const result = await pool.query(
      `INSERT INTO ${schemaName}.customers (fname, lname, pnum, price, style)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fName, lName, pNum, price, style]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const { id } = req.params;
    const { fname, lname, pnum, price, style } = req.body;
    const schemaName = getUserSchema(req.user.email);

    const result = await pool.query(
      `UPDATE ${schemaName}.customers 
       SET fname = $1, lname = $2, pnum = $3, price = $4, style = $5
       WHERE id = $6
       RETURNING *`,
      [fname, lname, pnum, price, style, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Request received to delete customer with ID:', id);

  try {
    // Log the current database being used
    const schemaName = getUserSchema(req.user.email);
    const dbInfo = await pool.query('SELECT current_database()');
    console.log('Connected to database:', dbInfo.rows[0].current_database);

    const query = `DELETE FROM ${schemaName}.customers WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      console.error('No customer found with ID:', id);
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer deleted successfully', customer: result.rows[0] });
  } catch (error) {
    console.error('Error processing DELETE request:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;