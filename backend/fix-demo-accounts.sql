-- Fix and ensure all demo accounts exist with correct passwords

-- Ensure all demo users exist (using correct schema without first_name/last_name)
INSERT OR REPLACE INTO users (id, email, password_hash, role, kyc_status, tenant_id, created_at) VALUES
('demo-user-1', 'john.doe@microfi.com', 'demo123', 'user', 'verified', 'demo-tenant', CURRENT_TIMESTAMP),
('demo-user-2', 'jane.smith@microfi.com', 'demo123', 'user', 'verified', 'demo-tenant', CURRENT_TIMESTAMP),
('demo-admin-1', 'sarah.admin@microfi.com', 'admin123', 'admin', 'verified', 'demo-tenant', CURRENT_TIMESTAMP),
('demo-business-1', 'mike.business@microfi.com', 'business123', 'user', 'verified', 'demo-tenant', CURRENT_TIMESTAMP),
('demo-admin-2', 'demo.admin@microfi.com', 'admin123', 'admin', 'verified', 'demo-tenant', CURRENT_TIMESTAMP);

-- Ensure client1 tenant users
INSERT OR REPLACE INTO users (id, email, password_hash, role, kyc_status, tenant_id, created_at) VALUES
('client1-admin-1', 'admin@client1.microfi.com', 'admin123', 'admin', 'verified', 'client1-tenant', CURRENT_TIMESTAMP),
('client1-user-1', 'user@client1.microfi.com', 'demo123', 'user', 'verified', 'client1-tenant', CURRENT_TIMESTAMP);

-- Ensure client2 tenant users
INSERT OR REPLACE INTO users (id, email, password_hash, role, kyc_status, tenant_id, created_at) VALUES
('client2-admin-1', 'admin@client2.microfi.com', 'admin123', 'admin', 'verified', 'client2-tenant', CURRENT_TIMESTAMP),
('client2-user-1', 'user@client2.microfi.com', 'demo123', 'user', 'verified', 'client2-tenant', CURRENT_TIMESTAMP);

-- Create demo accounts for each user
INSERT OR REPLACE INTO accounts (id, user_id, account_number, balance, currency, type, tenant_id, created_at) VALUES
-- Demo tenant accounts
('acc-demo-user-1-savings', 'demo-user-1', '1001234567', 150000, 'GHS', 'savings', 'demo-tenant', CURRENT_TIMESTAMP),
('acc-demo-user-1-current', 'demo-user-1', '2001234567', 75000, 'GHS', 'current', 'demo-tenant', CURRENT_TIMESTAMP),
('acc-demo-user-2-savings', 'demo-user-2', '1001234568', 200000, 'GHS', 'savings', 'demo-tenant', CURRENT_TIMESTAMP),
('acc-demo-business-1-business', 'demo-business-1', '3001234567', 500000, 'GHS', 'current', 'demo-tenant', CURRENT_TIMESTAMP),

-- Client1 tenant accounts
('acc-client1-user-1-savings', 'client1-user-1', '1002234567', 100000, 'USD', 'savings', 'client1-tenant', CURRENT_TIMESTAMP),

-- Client2 tenant accounts
('acc-client2-user-1-savings', 'client2-user-1', '1003234567', 80000, 'EUR', 'savings', 'client2-tenant', CURRENT_TIMESTAMP);

-- Create some demo transactions
INSERT OR REPLACE INTO transactions (id, from_account, to_account, amount, currency, description, status, reference, user_id, tenant_id, timestamp) VALUES
('txn-demo-1', 'acc-demo-user-1-current', 'acc-demo-user-2-savings', 5000, 'GHS', 'Transfer to Jane', 'completed', 'TXN-DEMO-001', 'demo-user-1', 'demo-tenant', CURRENT_TIMESTAMP),
('txn-demo-2', 'acc-demo-business-1-business', 'acc-demo-user-1-savings', 25000, 'GHS', 'Business payment', 'completed', 'TXN-DEMO-002', 'demo-business-1', 'demo-tenant', CURRENT_TIMESTAMP);

-- Create demo savings plans
INSERT OR REPLACE INTO savings_plans (id, user_id, account_id, goal_name, target_amount, current_amount, interest_rate, frequency, start_date, end_date, status, tenant_id, created_at) VALUES
('savings-demo-1', 'demo-user-1', 'acc-demo-user-1-savings', 'Emergency Fund', 500000, 150000, 0.05, 'monthly', '2024-01-01', '2024-12-31', 'active', 'demo-tenant', CURRENT_TIMESTAMP),
('savings-demo-2', 'demo-user-2', 'acc-demo-user-2-savings', 'Vacation Fund', 300000, 200000, 0.04, 'weekly', '2024-02-01', '2024-08-31', 'active', 'demo-tenant', CURRENT_TIMESTAMP);