-- VeriBridge Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for future auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  country VARCHAR(100) DEFAULT 'Kenya',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  
  -- Personal info (hashed/encrypted in production)
  full_name VARCHAR(255) NOT NULL,
  id_number_hash VARCHAR(64),
  
  -- Address info
  formatted_address TEXT NOT NULL,
  country VARCHAR(100) DEFAULT 'Kenya',
  
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Verification details
  platform VARCHAR(100) DEFAULT 'Google Play Console',
  score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'VERIFIED',
  
  -- QR Code data
  qr_code_url TEXT,
  verification_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year'),
  
  -- Indexes
  CONSTRAINT valid_status CHECK (status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'REVOKED'))
);

-- Payments table (MPESA)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id VARCHAR(30) UNIQUE NOT NULL,
  verification_id UUID REFERENCES verifications(id),
  user_id UUID REFERENCES users(id),
  
  -- Payment details
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  phone VARCHAR(20),
  
  -- MPESA specific
  checkout_request_id VARCHAR(100),
  merchant_request_id VARCHAR(100),
  mpesa_receipt VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'PENDING',
  failure_reason TEXT,
  
  -- Service purchased
  service_id VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  CONSTRAINT valid_payment_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Services subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  service_id VARCHAR(50) NOT NULL,
  
  -- Subscription details
  status VARCHAR(20) DEFAULT 'ACTIVE',
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  amount INTEGER,
  
  -- Dates
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  CONSTRAINT valid_sub_status CHECK (status IN ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAUSED'))
);

-- Service leads (for upsells)
CREATE TABLE IF NOT EXISTS service_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id VARCHAR(50) NOT NULL,
  
  -- Contact info
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Context
  verification_id VARCHAR(20),
  source VARCHAR(50),
  notes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'NEW',
  contacted_at TIMESTAMP,
  converted_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- API usage (for B2B billing)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  -- Request details
  endpoint VARCHAR(100),
  request_count INTEGER DEFAULT 1,
  
  -- Billing
  billed BOOLEAN DEFAULT FALSE,
  amount INTEGER,
  
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verifications_verification_id ON verifications(verification_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_request_id ON payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON api_usage(user_id, date);
