-- VeriBridge Company Formation Tables
-- Migration: Add Company Formation Support

-- Company Formation Orders
CREATE TABLE IF NOT EXISTS company_formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  -- Company Details
  company_name VARCHAR(255) NOT NULL,
  alt_name_1 VARCHAR(255),
  alt_name_2 VARCHAR(255),
  jurisdiction VARCHAR(10) NOT NULL CHECK (jurisdiction IN ('UK', 'US')),
  company_type VARCHAR(10) NOT NULL CHECK (company_type IN ('LTD', 'LLC')),
  industry_code VARCHAR(10),
  shares_count INTEGER DEFAULT 100,
  
  -- Director Information (from verified user)
  director_name VARCHAR(255) NOT NULL,
  director_address TEXT NOT NULL,
  director_email VARCHAR(255),
  director_phone VARCHAR(20),
  
  -- Registered Office (from wholesale partner)
  registered_office_address TEXT,
  
  -- Order Status
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'REJECTED'
  )),
  
 -- Registration Details (filled after completion)
  registration_number VARCHAR(50),
  incorporation_date DATE,
  certificate_url TEXT,
  
  -- Compliance
  sanctions_checked BOOLEAN DEFAULT FALSE,
  sanctions_result TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  
  -- Payment
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN (
    'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
  )),
  payment_ref VARCHAR(100),
  payment_id UUID REFERENCES payments(id),
  
  -- Admin Notes
  admin_notes TEXT,
  fulfillment_partner VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Indexes for performance
  CONSTRAINT valid_formation_status CHECK (status IN ('DRAFT', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'REJECTED'))
);

-- UK Name Search Cache (to reduce API calls)
CREATE TABLE IF NOT EXISTS uk_name_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_query VARCHAR(255) NOT NULL,
  is_available BOOLEAN NOT NULL,
  suggestions JSONB,
  searched_at TIMESTAMP DEFAULT NOW(),
  
  -- Auto-expire cache after 24 hours
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Audits / Activity Log (for compliance tracking)
CREATE TABLE IF NOT EXISTS formation_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formation_id UUID REFERENCES company_formations(id),
  action VARCHAR(50) NOT NULL,
  performed_by VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_formations_user_id ON company_formations(user_id);
CREATE INDEX IF NOT EXISTS idx_company_formations_status ON company_formations(status);
CREATE INDEX IF NOT EXISTS idx_company_formations_jurisdiction ON company_formations(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_company_formations_created_at ON company_formations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uk_name_searches_query ON uk_name_searches(search_query);
CREATE INDEX IF NOT EXISTS idx_uk_name_searches_expires ON uk_name_searches(expires_at);
CREATE INDEX IF NOT EXISTS idx_formation_audit_log_formation_id ON formation_audit_log(formation_id);

-- Add update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_formations_updated_at BEFORE UPDATE
  ON company_formations FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
