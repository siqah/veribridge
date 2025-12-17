-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT 0,
    last_login DATETIME
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add user_id to company_formations (if not exists)
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE
-- Run this manually if the column doesn't exist:
-- ALTER TABLE company_formations ADD COLUMN user_id TEXT;

-- Add user_id to mailbox_subscriptions (if not exists)
-- ALTER TABLE mailbox_subscriptions ADD COLUMN user_id TEXT;

-- Sessions table for JWT token management (optional)
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
   user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);
