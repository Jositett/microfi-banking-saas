-- Simple fix for demo accounts - just ensure users exist

-- Ensure all demo users exist
INSERT OR IGNORE INTO users (id, email, password_hash, role, kyc_status, tenant_id) VALUES
('demo-user-1', 'john.doe@microfi.com', 'demo123', 'user', 'verified', 'demo-tenant'),
('demo-user-2', 'jane.smith@microfi.com', 'demo123', 'user', 'verified', 'demo-tenant'),
('demo-admin-1', 'sarah.admin@microfi.com', 'admin123', 'admin', 'verified', 'demo-tenant'),
('demo-business-1', 'mike.business@microfi.com', 'business123', 'user', 'verified', 'demo-tenant'),
('demo-admin-2', 'demo.admin@microfi.com', 'admin123', 'admin', 'verified', 'demo-tenant');

-- Create basic accounts for demo users
INSERT OR IGNORE INTO accounts (id, user_id, tenant_id, account_number, balance, type) VALUES
('acc-demo-user-1-savings', 'demo-user-1', 'demo-tenant', '1001234567', 150000, 'savings'),
('acc-demo-user-2-savings', 'demo-user-2', 'demo-tenant', '1001234568', 200000, 'savings'),
('acc-demo-business-1-business', 'demo-business-1', 'demo-tenant', '3001234567', 500000, 'business');