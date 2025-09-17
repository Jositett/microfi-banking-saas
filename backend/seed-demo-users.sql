-- Insert demo users for testing
INSERT OR REPLACE INTO users (id, email, password_hash, role, kyc_status, created_at) VALUES 
('demo-user-1', 'john.doe@microfi.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'verified', CURRENT_TIMESTAMP),
('demo-admin-1', 'sarah.admin@microfi.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'verified', CURRENT_TIMESTAMP),
('demo-business-1', 'mike.business@microfi.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'verified', CURRENT_TIMESTAMP);

-- Insert demo accounts
INSERT OR REPLACE INTO accounts (id, user_id, account_number, type, balance, currency, status, created_at) VALUES
('acc-1', 'demo-user-1', '1234567890', 'savings', 1575050, 'GHS', 'active', CURRENT_TIMESTAMP),
('acc-2', 'demo-user-1', '1234567891', 'current', 892025, 'GHS', 'active', CURRENT_TIMESTAMP),
('acc-3', 'demo-admin-1', '9876543210', 'current', 2500000, 'GHS', 'active', CURRENT_TIMESTAMP),
('acc-4', 'demo-business-1', '5555666677', 'current', 4500075, 'GHS', 'active', CURRENT_TIMESTAMP),
('acc-5', 'demo-business-1', '5555666678', 'savings', 12000000, 'GHS', 'active', CURRENT_TIMESTAMP);