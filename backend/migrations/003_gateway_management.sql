-- Gateway configuration table for users to manage their own payment keys
CREATE TABLE IF NOT EXISTS gateway_configs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'paystack', 'flutterwave', 'momo'
  public_key TEXT NOT NULL,
  secret_key TEXT NOT NULL, -- Encrypted
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE(user_id, provider)
);

-- Communication usage tracking for billing
CREATE TABLE IF NOT EXISTS communication_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'sms' or 'email'
  recipient TEXT NOT NULL,
  cost INTEGER NOT NULL, -- in pesewas
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- User communication balance
ALTER TABLE users ADD COLUMN sms_balance INTEGER DEFAULT 0; -- in pesewas
ALTER TABLE users ADD COLUMN email_balance INTEGER DEFAULT 0; -- in pesewas

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gateway_configs_user_id ON gateway_configs (user_id);
CREATE INDEX IF NOT EXISTS idx_communication_usage_user_id ON communication_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_communication_usage_created_at ON communication_usage (created_at);