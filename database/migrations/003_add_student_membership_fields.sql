-- Migration: Add student membership and financial fields
-- Based on Excel import requirements

-- Add new fields to students table
ALTER TABLE students 
    ADD COLUMN IF NOT EXISTS spoc VARCHAR(20),
    ADD COLUMN IF NOT EXISTS sport VARCHAR(50),
    ADD COLUMN IF NOT EXISTS plan VARCHAR(20) CHECK (plan IN ('5 days A week', '3 days A week', 'other')),
    ADD COLUMN IF NOT EXISTS date_of_payment DATE,
    ADD COLUMN IF NOT EXISTS additional_days INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_membership_date DATE,
    ADD COLUMN IF NOT EXISTS registration_fees DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_registration DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS membership_amount DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_membership DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sibling_discount DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS membership_paid DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pending_amount DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pending_paid_on DATE,
    ADD COLUMN IF NOT EXISTS remarks TEXT,
    ADD COLUMN IF NOT EXISTS import_batch_id VARCHAR(50);

-- Create memberships table for tracking membership periods
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('5 days A week', '3 days A week', 'other')),
    sport VARCHAR(50) NOT NULL,
    spoc VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE,
    additional_days INTEGER DEFAULT 0,
    registration_fees DECIMAL(10,2) DEFAULT 0,
    discount_registration DECIMAL(10,2) DEFAULT 0,
    membership_amount DECIMAL(10,2) DEFAULT 0,
    discount_membership DECIMAL(10,2) DEFAULT 0,
    sibling_discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    pending_amount DECIMAL(10,2) DEFAULT 0,
    pending_paid_on DATE,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_students_spoc ON students(spoc);
CREATE INDEX IF NOT EXISTS idx_students_sport ON students(sport);
CREATE INDEX IF NOT EXISTS idx_students_plan ON students(plan);
CREATE INDEX IF NOT EXISTS idx_students_import_batch ON students(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_memberships_student_id ON memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_spoc ON memberships(spoc);

-- Create trigger for memberships updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_memberships_updated_at ON memberships;
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create import_logs table to track bulk imports
CREATE TABLE IF NOT EXISTS import_logs (
    id SERIAL PRIMARY KEY,
    import_batch_id VARCHAR(50) NOT NULL UNIQUE,
    file_name VARCHAR(255),
    total_rows INTEGER DEFAULT 0,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    error_log TEXT,
    imported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_import_logs_batch ON import_logs(import_batch_id);
