const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Helper function to get user schema
const getUserSchema = (email) => `user_${email.replace('@', '_at_').replace('.', '_dot_')}`;

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const schemaName = getUserSchema(req.user.email);
    const result = await pool.query(`
      SELECT a.*, c.fname as customer_fname, c.lname as customer_lname
      FROM ${schemaName}.appointments a
      JOIN ${schemaName}.customers c ON a.customer_id = c.id
      ORDER BY a.date, a.start_time
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create appointment
router.post('/', async (req, res) => {
  try {
    const schemaName = getUserSchema(req.user.email);
    const { customer_id, date, start_time, end_time, notes } = req.body;

    console.log('Received appointment data:', { customer_id, date, start_time, end_time, notes });

    // Validate required fields
    if (!customer_id || !date || !start_time || !end_time) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { customer_id, date, start_time, end_time }
      });
    }

    const result = await pool.query(`
      INSERT INTO ${schemaName}.appointments 
      (customer_id, date, start_time, end_time, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [customer_id, date, start_time, end_time, notes]
    );

    // Fetch customer details for the response
    const appointmentWithCustomer = await pool.query(`
      SELECT a.*, c.fname as customer_fname, c.lname as customer_lname
      FROM ${schemaName}.appointments a
      JOIN ${schemaName}.customers c ON a.customer_id = c.id
      WHERE a.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(appointmentWithCustomer.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const schemaName = getUserSchema(req.user.email);
    const { id } = req.params;
    console.log('Received request to delete appointment with ID:', id);

    if (!id) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    const result = await pool.query(`
      DELETE FROM ${schemaName}.appointments
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      console.error('Appointment not found for ID:', id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment deleted successfully', appointment: result.rows[0] });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;