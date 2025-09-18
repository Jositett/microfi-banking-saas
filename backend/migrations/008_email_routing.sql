-- Email Routing and Custom Domain Support
-- Migration for Premium+ plan email features

-- Email routes table (for custom domain emails)
CREATE TABLE IF NOT EXISTS email_routes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  custom_domain TEXT NOT NULL,
  email_address TEXT NOT NULL, -- e.g., support@clientdomain.com
  destination_email TEXT NOT NULL, -- where emails are forwarded
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Email redirects table (for basic plan email forwarding)
CREATE TABLE IF NOT EXISTS email_redirects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_email TEXT NOT NULL, -- e.g., tenant@microfi.com
  destination_email TEXT NOT NULL, -- client's actual email
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Custom domains table (for premium+ plans)
CREATE TABLE IF NOT EXISTS custom_domains (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  domain_name TEXT UNIQUE NOT NULL, -- e.g., clientbank.com
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
  dns_configured BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_routes_tenant ON email_routes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_redirects_tenant ON email_redirects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_tenant ON custom_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_name ON custom_domains(domain_name);