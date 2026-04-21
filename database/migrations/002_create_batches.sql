-- Create batches table for grouping students
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sport_type VARCHAR(50) NOT NULL DEFAULT 'general',
    skill_level VARCHAR(20) DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all')),
    coach_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    current_enrolled INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create batch_students junction table
CREATE TABLE IF NOT EXISTS batch_students (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, student_id)
);

-- Add batch_id to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_batches_coach_id ON batches(coach_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_sport_type ON batches(sport_type);
CREATE INDEX IF NOT EXISTS idx_batch_students_batch_id ON batch_students(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_students_student_id ON batch_students(student_id);
CREATE INDEX IF NOT EXISTS idx_classes_batch_id ON classes(batch_id);

-- Create trigger for batches updated_at
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for batch_students updated_at
CREATE TRIGGER update_batch_students_updated_at BEFORE UPDATE ON batch_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
