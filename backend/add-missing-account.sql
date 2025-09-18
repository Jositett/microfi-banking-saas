-- Add the missing business account
INSERT OR IGNORE INTO users (id, email, password_hash, role, kyc_status, tenant_id) VALUES
('demo-business-1', 'mike.business@microfi.com', 'business123', 'user', 'verified', 'demo-tenant');