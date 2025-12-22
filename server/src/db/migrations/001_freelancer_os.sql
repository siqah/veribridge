-- VeriBridge Freelancer Operating System Migration
-- Adds tables for: Company Formation, Invoicing, Digital Mailbox, B2B API

-- Company Orders Table (for UK Ltd / US LLC formation concierge service)
CREATE TABLE IF NOT EXISTS company_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  -- Order details
  company_type VARCHAR(20) NOT NULL CHECK (company_type IN ('UK_LTD', 'US_LLC')),
  proposed_names JSONB NOT NULL, -- Array of 3 proposed company names
  
  -- Director information
  director_data JSONB NOT NULL, -- {fullName, email, phone, address}
  passport_number VARCHAR(50),
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED')),
  payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED')),
  
  -- Admin fields
  admin_notes TEXT,
  assigned_to VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Invoices Table (main invoice metadata)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  -- Invoice details
  invoice_number VARCHAR(30) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  currency VARCHAR(10) NOT NULL CHECK (currency IN ('KES', 'USD', 'GBP', 'EUR')),
  
  -- Financial data
  subtotal DECIMAL(12, 2) NOT NULL,
  kra_tax DECIMAL(12, 2) DEFAULT 0, -- 1.5% for KES invoices
  total DECIMAL(12, 2) NOT NULL,
  
  -- Payment details (bank info, etc.)
  payment_details JSONB,
  
  -- PDF storage
  pdf_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'CANCELLED')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  paid_at TIMESTAMP
);

-- Invoice Items Table (line items for invoices)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Line item details
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  rate DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL, -- quantity * rate
  
  -- Order for display
  item_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mailbox Items Table (scanned mail for virtual address service)
CREATE TABLE IF NOT EXISTS mailbox_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  -- Mail details
  sender VARCHAR(255),
  subject VARCHAR(500),
  received_date DATE NOT NULL,
  
  -- Scanned image
  scanned_image_url TEXT,
  thumbnail_url TEXT,
  
  -- Categorization
  mail_type VARCHAR(50) DEFAULT 'letter' CHECK (mail_type IN ('letter', 'package', 'magazine', 'postcard', 'official')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'forwarded')),
  
  -- Actions
  forwarded_to TEXT,
  forwarded_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- API Keys Table (for B2B API authentication)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  -- Key data (store hashed version)
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(12) NOT NULL, -- First 8 chars for display (e.g., "vb_12345678")
  
  -- Metadata
  name VARCHAR(100), -- User-friendly name
  description TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  
  -- Usage tracking
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  
  -- Rate limiting
  rate_limit_per_day INTEGER DEFAULT 1000,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- NULL = no expiration
  revoked_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_orders_user_id ON company_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_company_orders_status ON company_orders(status);
CREATE INDEX IF NOT EXISTS idx_company_orders_created_at ON company_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_mailbox_items_user_id ON mailbox_items(user_id);
CREATE INDEX IF NOT EXISTS idx_mailbox_items_status ON mailbox_items(status);
CREATE INDEX IF NOT EXISTS idx_mailbox_items_received_date ON mailbox_items(received_date DESC);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);

-- Add trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_company_orders_updated_at BEFORE UPDATE ON company_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE company_orders IS 'Concierge service orders for UK Ltd/US LLC company formation';
COMMENT ON TABLE invoices IS 'Professional invoices with KRA tax calculation for freelancers';
COMMENT ON TABLE invoice_items IS 'Line items for invoices (description, quantity, rate)';
COMMENT ON TABLE mailbox_items IS 'Scanned mail items for virtual address subscription service';
COMMENT ON TABLE api_keys IS 'API keys for B2B address cleaning API authentication';
