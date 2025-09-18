-- MicroFi Banking SaaS - Complete Production Database Setup
-- Consolidates all migrations and setup into one file for remote deployment

-- Core Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  kyc_status TEXT NOT NULL CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  tenant_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  tenant_id TEXT NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GHS',
  type TEXT NOT NULL CHECK (type IN ('savings', 'current', 'investment', 'business')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  from_account_id TEXT REFERENCES accounts(id),
  to_account_id TEXT REFERENCES accounts(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  description TEXT,
  reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Savings Plans Table
CREATE TABLE IF NOT EXISTS savings_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  tenant_id TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  goal_name TEXT NOT NULL,
  target_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0,
  interest_rate REAL DEFAULT 0.05,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  tenant_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  interest_rate REAL NOT NULL,
  term_months INTEGER NOT NULL,
  monthly_payment INTEGER,
  outstanding_balance INTEGER,
  status TEXT CHECK (status IN ('pending', 'approved', 'active', 'completed', 'defaulted')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  tenant_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Tenant Tables
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  subscription_plan TEXT CHECK (subscription_plan IN ('starter', 'professional', 'premium', 'enterprise')) DEFAULT 'starter',
  status TEXT CHECK (status IN ('active', 'suspended', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  company_name TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  logo_url TEXT,
  currency TEXT DEFAULT 'GHS',
  timezone TEXT DEFAULT 'Africa/Accra',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'admin')) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Tables
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'premium', 'enterprise')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'past_due')) DEFAULT 'active',
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_payments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'GHS',
  status TEXT CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  payment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_usage (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  usage_type TEXT NOT NULL CHECK (usage_type IN ('users', 'transactions', 'storage', 'api_calls')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS communication_usage (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  service_type TEXT CHECK (service_type IN ('sms', 'email')) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  cost_per_unit REAL DEFAULT 0.05,
  total_cost REAL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gateway Management Tables
CREATE TABLE IF NOT EXISTS gateway_configs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  gateway_name TEXT NOT NULL,
  public_key TEXT,
  secret_key_encrypted TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gateway_configurations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  gateway_type TEXT NOT NULL CHECK (gateway_type IN ('paystack', 'flutterwave', 'mtn_momo')),
  public_key TEXT,
  secret_key_encrypted TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Routing Tables
CREATE TABLE IF NOT EXISTS email_routes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  domain TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  route_type TEXT CHECK (route_type IN ('forward', 'catch_all')) DEFAULT 'forward',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_redirects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  redirect_type TEXT CHECK (redirect_type IN ('permanent', 'temporary')) DEFAULT 'permanent',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_domains (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  domain TEXT UNIQUE NOT NULL,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'failed')) DEFAULT 'pending',
  ssl_status TEXT CHECK (ssl_status IN ('pending', 'active', 'failed')) DEFAULT 'pending',
  dns_records TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RBAC Table
CREATE TABLE IF NOT EXISTS roles_permissions (
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  PRIMARY KEY (role, permission)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id ON accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_savings_plans_user_id ON savings_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Insert Default Role Permissions
INSERT OR IGNORE INTO roles_permissions (role, permission) VALUES
('user', 'view_accounts'),
('user', 'create_transactions'),
('user', 'view_transactions'),
('user', 'create_savings'),
('user', 'view_savings'),
('user', 'apply_loan'),
('user', 'view_loans'),
('admin', 'view_accounts'),
('admin', 'create_transactions'),
('admin', 'view_transactions'),
('admin', 'create_savings'),
('admin', 'view_savings'),
('admin', 'apply_loan'),
('admin', 'view_loans'),
('admin', 'manage_users'),
('admin', 'view_reports'),
('admin', 'manage_settings'),
('super_admin', 'manage_tenants'),
('super_admin', 'view_analytics'),
('super_admin', 'manage_subscriptions'),
('super_admin', 'system_admin');

-- Insert Demo Tenants
INSERT OR IGNORE INTO tenants (id, name, domain, subscription_plan, status) VALUES
('demo-tenant', 'Demo Banking', 'demo.microfi.com', 'enterprise', 'active'),
('client1-tenant', 'Client One Bank', 'client1.microfi.com', 'professional', 'active'),
('client2-tenant', 'Client Two Financial', 'client2.microfi.com', 'starter', 'active');

-- Insert Tenant Settings
INSERT OR IGNORE INTO tenant_settings (id, tenant_id, company_name, primary_color, currency, timezone) VALUES
('settings-demo', 'demo-tenant', 'Demo Banking Corp', '#3b82f6', 'GHS', 'Africa/Accra'),
('settings-client1', 'client1-tenant', 'Client One Bank Ltd', '#10b981', 'GHS', 'Africa/Accra'),
('settings-client2', 'client2-tenant', 'Client Two Financial', '#f59e0b', 'GHS', 'Africa/Accra');

-- Insert Admin User
INSERT OR IGNORE INTO admin_users (id, email, password_hash, first_name, last_name, role) VALUES
('admin-001', 'admin@microfi.com', 'admin123', 'System', 'Administrator', 'super_admin');

-- Insert Demo Users
INSERT OR IGNORE INTO users (id, email, password_hash, role, kyc_status, tenant_id) VALUES
('test-user-1', 'test@microfi.com', 'test123', 'user', 'verified', 'demo-tenant'),
('demo-user-1', 'john.doe@microfi.com', 'demo123', 'user', 'verified', 'demo-tenant'),
('demo-admin-1', 'sarah.admin@microfi.com', 'admin123', 'admin', 'verified', 'demo-tenant'),
('demo-business-1', 'mike.business@microfi.com', 'business123', 'user', 'verified', 'demo-tenant');

-- Insert Demo Accounts
INSERT OR IGNORE INTO accounts (id, user_id, tenant_id, account_number, balance, type) VALUES
('acc-test-1', 'test-user-1', 'demo-tenant', '2024595697517', 0, 'savings'),
('acc-demo-1', 'demo-user-1', 'demo-tenant', '1234567890', 1575050, 'savings'),
('acc-demo-2', 'demo-user-1', 'demo-tenant', '1234567891', 892025, 'current'),
('acc-admin-1', 'demo-admin-1', 'demo-tenant', '1234567892', 2500000, 'savings'),
('acc-business-1', 'demo-business-1', 'demo-tenant', '1234567893', 5000000, 'business'),
('acc-business-2', 'demo-business-1', 'demo-tenant', '1234567894', 1250000, 'current');

-- Insert Sample Usage Data
INSERT OR IGNORE INTO subscription_usage (id, tenant_id, usage_type, usage_count, usage_limit, period_start, period_end) VALUES
('usage-001', 'demo-tenant', 'users', 4, 50, '2025-01-01', '2025-01-31'),
('usage-002', 'demo-tenant', 'transactions', 0, 1000, '2025-01-01', '2025-01-31'),
('usage-003', 'demo-tenant', 'storage', 125, 1000, '2025-01-01', '2025-01-31'),
('usage-004', 'client1-tenant', 'users', 2, 25, '2025-01-01', '2025-01-31'),
('usage-005', 'client2-tenant', 'users', 1, 10, '2025-01-01', '2025-01-31');

-- Insert Sample Gateway Configurations
INSERT OR IGNORE INTO gateway_configurations (id, tenant_id, gateway_type, public_key, is_active) VALUES
('gw-001', 'demo-tenant', 'paystack', 'pk_test_demo123', true),
('gw-002', 'demo-tenant', 'flutterwave', 'FLWPUBK_TEST-demo123', false),
('gw-003', 'client1-tenant', 'paystack', 'pk_test_client1', true);