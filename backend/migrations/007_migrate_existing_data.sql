-- Multi-Tenant Data Migration
-- Phase 1: Migrate existing single-tenant data to multi-tenant structure

-- Create default demo tenant for existing data
INSERT OR IGNORE INTO tenants (id, name, domain, status, subscription_plan) 
VALUES ('demo-tenant', 'Demo Banking', 'demo.microfi.com', 'active', 'enterprise');

-- Create default tenant settings
INSERT OR IGNORE INTO tenant_settings (id, tenant_id, company_name, currency, timezone)
VALUES ('demo-settings', 'demo-tenant', 'Demo Banking Corp', 'GHS', 'Africa/Accra');

-- Create default admin user
INSERT OR IGNORE INTO admin_users (id, email, password_hash, first_name, last_name, role)
VALUES (
  'admin-001', 
  'admin@microfi.com', 
  '$2b$10$rQZ9vKzX8vKzX8vKzX8vKzX8vKzX8vKzX8vKzX8vKzX8vKzX8vKzX8', -- demo123
  'System',
  'Administrator',
  'super_admin'
);

-- Migrate existing users to demo tenant
UPDATE users SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;

-- Migrate existing accounts to demo tenant
UPDATE accounts SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;

-- Migrate existing transactions to demo tenant
UPDATE transactions SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;

-- Migrate existing savings plans to demo tenant
UPDATE savings_plans SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;

-- Migrate existing loans to demo tenant
UPDATE loans SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;

-- Migrate existing audit logs to demo tenant
UPDATE audit_logs SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;

-- Create additional demo tenants for testing
INSERT OR IGNORE INTO tenants (id, name, domain, status, subscription_plan) VALUES
('client1-tenant', 'Client One Bank', 'client1.microfi.com', 'active', 'professional'),
('client2-tenant', 'Client Two Financial', 'client2.microfi.com', 'active', 'starter');

-- Create settings for demo tenants
INSERT OR IGNORE INTO tenant_settings (id, tenant_id, company_name, primary_color, currency) VALUES
('client1-settings', 'client1-tenant', 'Client One Bank Ltd', '#10b981', 'USD'),
('client2-settings', 'client2-tenant', 'Client Two Financial Services', '#f59e0b', 'EUR');