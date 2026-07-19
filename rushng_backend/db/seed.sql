-- ================================================================
-- RUSHNG - Seed Data
-- ================================================================

-- ================================================================
-- SERVICE CATEGORIES (already in init.sql as enum)
-- ================================================================

-- Insert default admin if not exists (already in init.sql)

-- ================================================================
-- INSERT TEST PROVIDERS (for development)
-- ================================================================

-- Note: These should be created via the application,
-- but here's the SQL for reference

-- ================================================================
-- INSERT SERVICE TYPES (for reference)
-- ================================================================

-- The service categories are defined as enums:
-- 'plumbing', 'electrical', 'carpentry', 'painting', 'tiling',
-- 'masonry', 'welding', 'cleaning', 'laundry', 'shopping',
-- 'errands', 'repair', 'maintenance', 'installation', 'other'

-- ================================================================
-- INSERT DEFAULT ADVERTISING PLANS
-- ================================================================

-- This is handled in the application code

-- ================================================================
-- INSERT TEST JOB (for development)
-- ================================================================

-- This should be created via the application

-- ================================================================
-- VIEWS FOR ANALYTICS
-- ================================================================

-- Provider performance view
CREATE OR REPLACE VIEW provider_performance AS
SELECT 
    p.id AS provider_id,
    u.full_name,
    p.rating,
    p.total_jobs_completed,
    p.total_jobs_cancelled,
    p.total_earnings,
    p.compliance_score,
    ROUND(
        (p.total_jobs_completed::FLOAT / NULLIF(p.total_jobs_completed + p.total_jobs_cancelled, 0) * 100),
        2
    ) AS completion_rate
FROM providers p
JOIN users u ON p.user_id = u.id;

-- Platform stats view
CREATE OR REPLACE VIEW platform_stats AS
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
    (SELECT COUNT(*) FROM providers) AS total_providers,
    (SELECT COUNT(*) FROM jobs WHERE status = 'posted') AS open_jobs,
    (SELECT COUNT(*) FROM jobs WHERE status = 'in_progress') AS active_jobs,
    (SELECT COUNT(*) FROM jobs WHERE status = 'completed') AS completed_jobs,
    (SELECT COUNT(*) FROM jobs WHERE created_at > NOW() - INTERVAL '7 days') AS jobs_last_7_days,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'released') AS total_revenue,
    (SELECT COALESCE(SUM(platform_fee), 0) FROM payments WHERE status = 'released') AS total_platform_fee;