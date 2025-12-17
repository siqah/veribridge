-- SQLite Schema for Digital Mailbox Service
-- Virtual business address with mail forwarding

-- Mailbox Subscriptions
CREATE TABLE IF NOT EXISTS mailbox_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  
  -- Virtual Address Details
  location TEXT NOT NULL CHECK (location IN ('LONDON', 'NAIROBI', 'DELAWARE')),
  virtual_address TEXT NOT NULL,
  
  -- Subscription Details
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('BASIC', 'PRO')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED')),
  
  -- Billing
  monthly_fee REAL NOT NULL,
  next_billing_date TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  cancelled_at TEXT,
  
  UNIQUE(user_id)
);

-- Mail Items Received
CREATE TABLE IF NOT EXISTS mail_items (
  id TEXT PRIMARY KEY,
  mailbox_id TEXT NOT NULL,
  
  -- Mail Details
  sender TEXT,
  mail_type TEXT NOT NULL CHECK (mail_type IN ('LETTER', 'PACKAGE', 'POSTCARD', 'MAGAZINE', 'OTHER')),
  subject TEXT,
  weight_grams INTEGER,
  
  -- Dates
  received_date TEXT NOT NULL,
  scanned_date TEXT,
  
  -- Status
  status TEXT DEFAULT 'RECEIVED' CHECK (status IN (
    'RECEIVED', 'SCANNED', 'FORWARDED', 'ARCHIVED', 'DISPOSED'
  )),
  is_read INTEGER DEFAULT 0,
  
  -- Files
  scan_url TEXT,
  thumbnail_url TEXT,
  
  -- Notes
  admin_notes TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (mailbox_id) REFERENCES mailbox_subscriptions(id)
);

-- Forwarding Requests
CREATE TABLE IF NOT EXISTS forwarding_requests (
  id TEXT PRIMARY KEY,
  mail_item_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Destination
  destination_address TEXT NOT NULL,
  destination_city TEXT,
  destination_country TEXT,
  
  -- Shipping
  shipping_method TEXT CHECK (shipping_method IN ('STANDARD', 'EXPRESS', 'PRIORITY')),
  tracking_number TEXT,
  carrier TEXT,
  
  -- Cost
  forwarding_cost REAL NOT NULL,
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
  payment_ref TEXT,
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'FAILED'
  )),
  
  -- Timestamps
  requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
  shipped_at TEXT,
  delivered_at TEXT,
  
  FOREIGN KEY (mail_item_id) REFERENCES mail_items(id)
);

-- Virtual Address Templates (for assignment)
CREATE TABLE IF NOT EXISTS virtual_addresses (
  id TEXT PRIMARY KEY,
  location TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  is_available INTEGER DEFAULT 1,
  assigned_to_user TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mailbox_user ON mailbox_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_mailbox_status ON mailbox_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_mail_items_mailbox ON mail_items(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_mail_items_status ON mail_items(status);
CREATE INDEX IF NOT EXISTS idx_mail_items_date ON mail_items(received_date);
CREATE INDEX IF NOT EXISTS idx_forwarding_mail ON forwarding_requests(mail_item_id);
CREATE INDEX IF NOT EXISTS idx_forwarding_status ON forwarding_requests(status);

-- Seed virtual addresses
INSERT INTO virtual_addresses (id, location, address_line1, city, postal_code, country, is_available) VALUES
  ('addr_london_1', 'LONDON', '123 Regent Street', 'London', 'W1B 4HZ', 'United Kingdom', 1),
  ('addr_nairobi_1', 'NAIROBI', 'Westlands Office Park, Waiyaki Way', 'Nairobi', '00100', 'Kenya', 1),
  ('addr_delaware_1', 'DELAWARE', '123 Corporation Boulevard', 'Wilmington, DE', '19801', 'United States', 1);
