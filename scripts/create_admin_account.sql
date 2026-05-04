-- Setup Pre-Configured Admin Account: admin67@gmail.com
-- This script completes the admin account setup in the database
-- The auth user must be created first via Supabase Auth or Admin API

-- Step 1: Create or repair the profile row from the auth user, then mark the user as admin
INSERT INTO profiles (
  id,
  email,
  full_name,
  is_admin
)
SELECT 
  u.id,
  u.email,
  'Admin User',
  TRUE
FROM auth.users u
WHERE u.email = 'admin67@gmail.com'
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_admin = TRUE;

-- Step 2: Mark onboarding as complete
INSERT INTO user_profile (
  user_id,
  personality_type,
  age_range,
  employment_status,
  monthly_income_range,
  savings_range,
  risk_tolerance,
  investment_knowledge,
  primary_goal,
  investment_duration,
  preferences,
  budget_min_tnd,
  budget_max_tnd,
  completed_at
)
SELECT 
  id,
  'analyst',
  '26_35',
  'employed',
  'gt_3000',
  'gt_5000',
  'high',
  'advanced',
  'maximize_profits',
  'long',
  ARRAY['stocks', 'crypto', 'real_estate'],
  5000,
  50000,
  NOW()
FROM profiles
WHERE email = 'admin67@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profile 
  WHERE user_id = profiles.id
);

-- Step 3: Verify setup
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_admin,
  p.created_at,
  CASE WHEN up.completed_at IS NOT NULL THEN 'Completed' ELSE 'Pending' END as onboarding_status
FROM profiles p
LEFT JOIN user_profile up ON p.id = up.user_id
WHERE p.email = 'admin67@gmail.com';
