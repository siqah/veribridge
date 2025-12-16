-- SQLite Schema for Company Formation
-- Run this with: node server/src/db/setupSQLite.js

-- Company Formation Orders
CREATE TABLE IF NOT EXISTS company_formations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  
  -- Company Details
  company_name TEXT NOT NULL,
  alt_name_1 TEXT,
  alt_name_2 TEXT,
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('UK', 'US')),
  company_type TEXT NOT NULL CHECK (company_type IN ('LTD', 'LLC')),
  industry_code TEXT,
  shares_count INTEGER DEFAULT 100,
  
  -- Director Information
  director_name TEXT NOT NULL,
  director_address TEXT NOT NULL,
  director_email TEXT,
  director_phone TEXT,
  
  -- Registered Office
  registered_office_address TEXT,
  
  -- Order Status
  status TEXT DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'REJECTED'
  )),
  
  -- Registration Details
  registration_number TEXT,
  incorporation_date TEXT,
  certificate_url TEXT,
  
  -- Compliance
  sanctions_checked INTEGER DEFAULT 0,
  sanctions_result TEXT,
  kyc_verified INTEGER DEFAULT 0,
  
  -- Payment
  payment_amount REAL NOT NULL,
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN (
    'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
  )),
  payment_ref TEXT,
  payment_id TEXT,
  
  -- Admin Notes
  admin_notes TEXT,
  fulfillment_partner TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

-- UK Name Search Cache
CREATE TABLE IF NOT EXISTS uk_name_searches (
  id TEXT PRIMARY KEY,
  search_query TEXT NOT NULL,
  is_available INTEGER NOT NULL,
  suggestions TEXT,
  searched_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT
);

-- Formation Audit Log
CREATE TABLE IF NOT EXISTS formation_audit_log (
  id TEXT PRIMARY KEY,
  formation_id TEXT,
  action TEXT NOT NULL,
  performed_by TEXT,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formation_id) REFERENCES company_formations(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_formations_user ON company_formations(user_id);
CREATE INDEX IF NOT EXISTS idx_formations_status ON company_formations(status);
CREATE INDEX IF NOT EXISTS idx_formations_jurisdiction ON company_formations(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_name_searches_query ON uk_name_searches(search_query);
CREATE INDEX IF NOT EXISTS idx_audit_formation ON formation_audit_log(formation_id);
