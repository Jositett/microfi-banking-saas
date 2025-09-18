-- Multi-Tenant SaaS Database Schema Migration
-- Phase 1: Add tenant support to existing schema

-- Create tenants table (master source of truth)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create tenant_settings table
CREATE TABLE IF NOT EXISTS tenant_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#64748b',
  currency TEXT DEFAULT 'GHS',
  timezone TEXT DEFAULT 'Africa/Accra',
  company_name TEXT,
  support_email TEXT,
  support_phone TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create admin_users table (separate from tenant users)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add tenant_id to existing tables
ALTER TABLE users ADD COLUMN tenant_id TEXT;
ALTER TABLE accounts ADD COLUMN tenant_id TEXT;
ALTER TABLE transactions ADD COLUMN tenant_id TEXT;
ALTER TABLE savings_plans ADD COLUMN tenant_id TEXT;
ALTER TABLE loans ADD COLUMN tenant_id TEXT;
ALTER TABLE audit_logs ADD COLUMN tenant_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id ON accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_savings_plans_tenant_id ON savings_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loans_tenant_id ON loans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_user ON accounts(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_account ON transactions(tenant_id, from_account);