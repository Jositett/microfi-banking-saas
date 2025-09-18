-- Complete missing database tables and indexes for optimal performance

-- Add missing indexes for performance
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

-- Add missing subscription_usage table (referenced in tests)
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

-- Add missing gateway_configurations table (referenced in tests)
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

-- Add roles_permissions table for RBAC
CREATE TABLE IF NOT EXISTS roles_permissions (
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  PRIMARY KEY (role, permission)
);

-- Insert default role permissions
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

-- Add sample subscription usage data
INSERT OR IGNORE INTO subscription_usage (id, tenant_id, usage_type, usage_count, usage_limit, period_start, period_end) VALUES
('usage-001', 'demo-tenant', 'users', 4, 50, '2025-01-01', '2025-01-31'),
('usage-002', 'demo-tenant', 'transactions', 0, 1000, '2025-01-01', '2025-01-31'),
('usage-003', 'demo-tenant', 'storage', 125, 1000, '2025-01-01', '2025-01-31'),
('usage-004', 'client1-tenant', 'users', 2, 25, '2025-01-01', '2025-01-31'),
('usage-005', 'client2-tenant', 'users', 1, 10, '2025-01-01', '2025-01-31');

-- Add sample gateway configurations
INSERT OR IGNORE INTO gateway_configurations (id, tenant_id, gateway_type, public_key, is_active) VALUES
('gw-001', 'demo-tenant', 'paystack', 'pk_test_demo123', true),
('gw-002', 'demo-tenant', 'flutterwave', 'FLWPUBK_TEST-demo123', false),
('gw-003', 'client1-tenant', 'paystack', 'pk_test_client1', true);