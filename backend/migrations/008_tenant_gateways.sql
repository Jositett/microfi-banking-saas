-- Tenant Gateway Configurations
CREATE TABLE IF NOT EXISTS tenant_gateways (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  gateway_type TEXT NOT NULL CHECK (gateway_type IN ('paystack', 'flutterwave', 'mtn_momo')),
  encrypted_config TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, gateway_type)
);

-- Gateway usage logs for audit
CREATE TABLE IF NOT EXISTS gateway_audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id TEXT NOT NULL,
  gateway_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'configure', 'test', 'activate', 'deactivate', 'decrypt'
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (gateway_id) REFERENCES tenant_gateways(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_gateways_tenant_id ON tenant_gateways(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_gateways_status ON tenant_gateways(status);
CREATE INDEX IF NOT EXISTS idx_gateway_audit_logs_tenant_id ON gateway_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gateway_audit_logs_timestamp ON gateway_audit_logs(timestamp);