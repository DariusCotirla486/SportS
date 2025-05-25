-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES user_roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create operation logs table
CREATE TABLE IF NOT EXISTS operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE'
    entity_type VARCHAR(50) NOT NULL, -- 'item', 'category', etc.
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create monitored users table
CREATE TABLE IF NOT EXISTS monitored_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default roles if they don't exist
INSERT INTO user_roles (id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'user')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user if it doesn't exist
-- Password is 'admin123' (hashed)
INSERT INTO users (id, email, password_hash, name, role_id)
SELECT 
    '123e4567-e89b-12d3-a456-426614174000',
    'admin@example.com',
    '$2a$10$rM7yDZ4R7yDZ4R7yDZ4R7O5Xz5Xz5Xz5Xz5Xz5Xz5Xz5Xz5Xz5Xz5',
    'Admin User',
    (SELECT id FROM user_roles WHERE name = 'admin')
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@example.com'
);

-- Insert test user if it doesn't exist
-- Password is 'test123' (hashed)
INSERT INTO users (id, email, password_hash, name, role_id)
SELECT 
    '123e4567-e89b-12d3-a456-426614174100',
    'test@example.com',
    '$2a$10$rM7yDZ4R7yDZ4R7yDZ4R7O5Xz5Xz5Xz5Xz5Xz5Xz5Xz5Xz5Xz5Xz5',
    'Test User',
    (SELECT id FROM user_roles WHERE name = 'user')
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'test@example.com'
); 