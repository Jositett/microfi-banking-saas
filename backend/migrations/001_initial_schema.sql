-- MicroFi Banking Database Schema
-- Initial migration for production deployment

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'business')),
    kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    phone TEXT,
    full_name TEXT,
    date_of_birth DATE,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed'))
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('savings', 'current', 'investment', 'business')),
    currency TEXT NOT NULL DEFAULT 'GHS',
    balance INTEGER NOT NULL DEFAULT 0, -- stored in kobo (smallest currency unit)
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    from_account TEXT,
    to_account TEXT,
    amount INTEGER NOT NULL, -- stored in kobo
    currency TEXT NOT NULL DEFAULT 'GHS',
    type TEXT NOT NULL CHECK (type IN ('transfer', 'deposit', 'withdrawal', 'payment')),
    description TEXT,
    reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    user_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account) REFERENCES accounts(id),
    FOREIGN KEY (to_account) REFERENCES accounts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Savings plans table
CREATE TABLE IF NOT EXISTS savings_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_amount INTEGER NOT NULL, -- stored in kobo
    current_amount INTEGER NOT NULL DEFAULT 0,
    monthly_contribution INTEGER,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('personal', 'business', 'mortgage', 'auto')),
    principal_amount INTEGER NOT NULL, -- stored in kobo
    outstanding_balance INTEGER NOT NULL,
    interest_rate REAL NOT NULL,
    term_months INTEGER NOT NULL,
    monthly_payment INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'defaulted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Audit logs table (for compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details TEXT, -- JSON string
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON savings_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- Insert demo users for development
INSERT OR IGNORE INTO users (id, email, password_hash, role, kyc_status, full_name, phone, status) VALUES
('demo-user-1', 'john.doe@microfi.com', 'demo123', 'user', 'verified', 'John Doe', '+233 24 123 4567', 'active'),
('demo-admin-1', 'sarah.admin@microfi.com', 'admin123', 'admin', 'verified', 'Sarah Johnson', '+233 24 987 6543', 'active'),
('demo-business-1', 'mike.business@microfi.com', 'business123', 'business', 'verified', 'Mike Osei', '+233 20 555 0123', 'active');

-- Insert demo accounts
INSERT OR IGNORE INTO accounts (id, user_id, account_number, type, balance, currency, status) VALUES
('acc-demo-1', 'demo-user-1', '1234567890', 'savings', 1575050, 'GHS', 'active'),
('acc-demo-2', 'demo-user-1', '1234567891', 'current', 892025, 'GHS', 'active'),
('acc-demo-3', 'demo-admin-1', '9876543210', 'current', 2500000, 'GHS', 'active'),
('acc-demo-4', 'demo-business-1', '5555666677', 'business', 4500075, 'GHS', 'active');