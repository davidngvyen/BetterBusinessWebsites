-- Add created_at columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add price column to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;

-- Add style column to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS style VARCHAR(100);

-- Add customer_id foreign key to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);

-- Add customer_name to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

-- Add start_time and end_time to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS start_time TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at); 