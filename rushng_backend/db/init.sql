-- ================================================================
-- RUSHNG - Complete Database Schema
-- ================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================================
-- ENUMS
-- ================================================================

-- User role enum
CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin', 'support');

-- Job category enum
CREATE TYPE job_category AS ENUM (
    'plumbing', 'electrical', 'carpentry', 'painting', 'tiling',
    'masonry', 'welding', 'cleaning', 'laundry', 'shopping',
    'errands', 'repair', 'maintenance', 'installation', 'other'
);

-- Job status enum
CREATE TYPE job_status AS ENUM (
    'posted', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
    'pending', 'held', 'released', 'refunded', 'failed', 'disputed'
);

-- Payment provider enum
CREATE TYPE payment_provider AS ENUM ('opay', 'paystack', 'flutterwave');

-- Violation type enum
CREATE TYPE violation_type AS ENUM (
    'no_show', 'poor_quality', 'theft', 'damage', 'harassment',
    'fraud', 'late_arrival', 'incomplete_work', 'bad_communication',
    'cancellation', 'other'
);

-- Violation severity enum
CREATE TYPE violation_severity AS ENUM ('minor', 'major', 'critical');

-- Violation status enum
CREATE TYPE violation_status AS ENUM (
    'pending_review', 'confirmed', 'dismissed', 'appealed', 'resolved'
);

-- Penalty type enum
CREATE TYPE penalty_type AS ENUM ('warning', 'suspension', 'ban', 'fine');

-- ================================================================
-- USERS TABLE
-- ================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(255),
    verification_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Personal Information
    nin VARCHAR(11) UNIQUE,
    bvn VARCHAR(11) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    profile_picture VARCHAR(500),
    
    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified_provider BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending',
    
    -- Password Reset
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    deletion_reason TEXT
);

-- ================================================================
-- PROVIDERS TABLE
-- ================================================================

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Skills & Experience
    skills TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    certifications JSONB DEFAULT '[]',
    
    -- Pricing
    hourly_rate DECIMAL(10,2),
    service_radius_km INTEGER DEFAULT 10,
    
    -- Location
    location GEOGRAPHY(POINT, 4326),
    
    -- Availability
    availability JSONB DEFAULT '{"days": [], "hours": []}',
    
    -- Verification
    verification_level VARCHAR(50) DEFAULT 'basic',
    verification_documents JSONB DEFAULT '[]',
    
    -- Portfolio
    portfolio_urls TEXT[] DEFAULT '{}',
    
    -- Status
    is_available BOOLEAN DEFAULT TRUE,
    is_on_duty BOOLEAN DEFAULT FALSE,
    
    -- Ratings & Stats
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_jobs_completed INTEGER DEFAULT 0,
    total_jobs_cancelled INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.0,
    
    -- Compliance
    compliance_score INTEGER DEFAULT 100,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT valid_compliance_score CHECK (compliance_score >= 0 AND compliance_score <= 100)
);

-- ================================================================
-- JOBS TABLE
-- ================================================================

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID REFERENCES users(id),
    
    -- Job Details
    category job_category NOT NULL,
    subcategory VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Location
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    
    -- Status
    status job_status DEFAULT 'posted',
    
    -- Pricing
    estimated_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    
    -- Schedule
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Check-in/out
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_in_photo VARCHAR(500),
    check_out_photo VARCHAR(500),
    check_in_otp_hash VARCHAR(255),
    check_out_otp_hash VARCHAR(255),
    check_in_location GEOGRAPHY(POINT, 4326),
    check_out_location GEOGRAPHY(POINT, 4326),
    
    -- Metadata
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- PAYMENTS TABLE
-- ================================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID NOT NULL REFERENCES users(id),
    
    -- Amounts
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    provider_earnings DECIMAL(10,2) NOT NULL,
    
    -- Provider
    provider payment_provider NOT NULL,
    reference VARCHAR(255) UNIQUE NOT NULL,
    
    -- Status
    status payment_status DEFAULT 'pending',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    held_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- VIOLATIONS TABLE
-- ================================================================

CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    job_id UUID REFERENCES jobs(id),
    reported_by UUID REFERENCES users(id),
    
    -- Type & Severity
    type violation_type NOT NULL,
    severity violation_severity DEFAULT 'minor',
    
    -- Details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '[]',
    
    -- Status
    status violation_status DEFAULT 'pending_review',
    
    -- Review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution TEXT,
    
    -- Penalty
    penalty_type penalty_type,
    penalty_details JSONB DEFAULT '{}',
    points_deducted INTEGER DEFAULT 0,
    
    -- Appeal
    appeal_status VARCHAR(50),
    appeal_reason TEXT,
    appeal_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- RATINGS TABLE
-- ================================================================

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    rater_id UUID NOT NULL REFERENCES users(id),
    target_id UUID NOT NULL REFERENCES users(id),
    
    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB DEFAULT '{}',
    
    -- Target type
    target_type VARCHAR(50) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- NOTIFICATIONS TABLE
-- ================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Details
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    delivered_via TEXT[] DEFAULT '{}',
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- AUDIT LOGS TABLE
-- ================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Action details
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(36),
    
    -- Context
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    method VARCHAR(10),
    
    -- Data
    changes JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- INDEXES
-- ================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_nin ON users(nin) WHERE nin IS NOT NULL;
CREATE INDEX idx_users_bvn ON users(bvn) WHERE bvn IS NOT NULL;

-- Providers indexes
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_skills ON providers USING GIN(skills);
CREATE INDEX idx_providers_location ON providers USING GIST(location);
CREATE INDEX idx_providers_is_available ON providers(is_available) WHERE is_available = true;

-- Jobs indexes
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_provider_id ON jobs(provider_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_location ON jobs USING GIST(location);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Payments indexes
CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_status ON payments(status);

-- Violations indexes
CREATE INDEX idx_violations_user_id ON violations(user_id);
CREATE INDEX idx_violations_status ON violations(status);

-- Ratings indexes
CREATE INDEX idx_ratings_job_id ON ratings(job_id);
CREATE INDEX idx_ratings_target_id ON ratings(target_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ================================================================
-- FULL TEXT SEARCH
-- ================================================================

-- Create search index for jobs
CREATE INDEX idx_jobs_search ON jobs USING GIN(
    to_tsvector('english', title || ' ' || description || ' ' || COALESCE(city, '') || ' ' || COALESCE(state, ''))
);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_violations_updated_at BEFORE UPDATE ON violations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ================================================================
-- SEED DATA
-- ================================================================

-- Insert default admin user (password: Admin@2024!)
INSERT INTO users (email, phone, password_hash, full_name, role, is_verified)
VALUES (
    'admin@rushng.com',
    '+2348012345678',
    '$2b$12$5Qk2jR9Qk2jR9Qk2jR9Qku1jR9Qk2jR9Qk2jR9Qk2jR9Qk2jR9Qku1',
    'System Administrator',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE users IS 'System users including customers, providers, and admins';
COMMENT ON TABLE providers IS 'Service provider profiles with skills and verification status';
COMMENT ON TABLE jobs IS 'Service jobs posted by customers and assigned to providers';
COMMENT ON TABLE payments IS 'Payment transactions with escrow support';
COMMENT ON TABLE violations IS 'Violation reports and accountability tracking';
COMMENT ON TABLE ratings IS 'User ratings for providers and customers';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';