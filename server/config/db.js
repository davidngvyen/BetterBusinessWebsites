require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

async function createUserSchema(email) {
  const schemaName = `user_${email.replace('@', '_at_').replace('.', '_dot_')}`;
  try {
    await pool.query(`
      CREATE SCHEMA IF NOT EXISTS ${schemaName};
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.customers (
        id SERIAL PRIMARY KEY,
        fname VARCHAR(100),
        lname VARCHAR(100),
        pnum VARCHAR(20),
        price DECIMAL(10,2),
        style VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schemaName}.appointments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES ${schemaName}.customers(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log(`Schema ${schemaName} created successfully`);
    return schemaName;
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
}


module.exports = { pool, createUserSchema };
