-- Subscription management tables
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  price_paid INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  member_limit INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payment_reference TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS subscription_payments (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_reference TEXT NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'subscription',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
);

-- Add subscription fields to users table
ALTER TABLE users ADD COLUMN subscription_plan TEXT;
ALTER TABLE users ADD COLUMN subscription_expires TEXT;
ALTER TABLE users ADD COLUMN member_limit INTEGER DEFAULT 50;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments (subscription_id);