-- Update demo users with simple passwords for testing
-- Note: In production, these would be properly hashed
UPDATE users SET password_hash = 'demo123' WHERE email = 'john.doe@microfi.com';
UPDATE users SET password_hash = 'admin123' WHERE email = 'sarah.admin@microfi.com';
UPDATE users SET password_hash = 'business123' WHERE email = 'mike.business@microfi.com';