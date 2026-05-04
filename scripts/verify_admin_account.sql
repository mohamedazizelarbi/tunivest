-- Verify Admin Account Setup
-- Run this query in Supabase SQL Editor to confirm admin67@gmail.com is set up correctly

WITH target AS (
  SELECT 'admin67@gmail.com'::text AS email
)
SELECT 
  t.email AS requested_email,
  u.id AS auth_user_id,
  u.email AS auth_email,
  p.id AS profile_id,
  p.full_name,
  p.is_admin,
  p.risk_profile,
  p.created_at,
  CASE 
    WHEN u.id IS NULL THEN 'Missing auth user'
    WHEN p.id IS NULL THEN 'Missing profile row'
    WHEN up.completed_at IS NULL THEN 'Onboarding pending'
    ELSE 'Ready'
  END AS account_status,
  CASE WHEN up.completed_at IS NOT NULL THEN 'Completed' ELSE 'Pending' END AS onboarding_status,
  up.personality_type,
  up.age_range,
  up.employment_status,
  up.monthly_income_range,
  up.savings_range,
  up.risk_tolerance,
  up.investment_knowledge,
  up.primary_goal,
  up.investment_duration,
  up.preferences,
  up.budget_min_tnd,
  up.budget_max_tnd,
  up.completed_at
FROM target t
LEFT JOIN auth.users u ON u.email = t.email
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_profile up ON up.user_id = p.id;

-- Expected result:
-- account_status: Ready
-- is_admin: true
-- onboarding_status: Completed
-- risk_profile: aggressive
