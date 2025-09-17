-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  kyc_status TEXT NOT NULL CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  account_number TEXT UNIQUE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0, -- stored in cents/kobo
  currency TEXT NOT NULL DEFAULT 'GHS',
  type TEXT NOT NULL CHECK (type IN ('savings', 'current', 'investment')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  from_account TEXT REFERENCES accounts(id),
  to_account TEXT REFERENCES accounts(id),
  amount INTEGER NOT NULL, -- stored in cents/kobo
  currency TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('transfer', 'deposit', 'withdrawal', 'payment')),
  description TEXT,
  reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL REFERENCES users(id)
);

-- Savings plans table
CREATE TABLE savings_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  name TEXT NOT NULL,
  target_amount INTEGER NOT NULL, -- stored in cents/kobo
  current_amount INTEGER NOT NULL DEFAULT 0, -- stored in cents/kobo
  interest_rate REAL NOT NULL DEFAULT 0.05,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE loans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL, -- stored in cents/kobo
  interest_rate REAL NOT NULL,
  term_months INTEGER NOT NULL,
  monthly_payment INTEGER NOT NULL, -- stored in cents/kobo
  outstanding_balance INTEGER NOT NULL, -- stored in cents/kobo
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'active', 'completed', 'defaulted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  disbursed_at TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSON,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_from_account ON transactions(from_account);
CREATE INDEX idx_transactions_to_account ON transactions(to_account);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_savings_plans_user_id ON savings_plans(user_id);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);