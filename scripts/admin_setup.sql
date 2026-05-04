-- Admin Account Setup Script for TuniVest
-- Run this in your Supabase SQL Editor to create/promote an admin user

-- OPTION 1: If you already have a user account, promote them to admin
-- Replace 'your-email@example.com' with the actual email
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';

-- OPTION 2: Verify admin status was set correctly
SELECT id, email, full_name, is_admin, created_at 
FROM profiles 
WHERE is_admin = TRUE
ORDER BY created_at DESC;

-- OPTION 3: To remove admin access from a user (if needed)
-- UPDATE profiles 
-- SET is_admin = FALSE 
-- WHERE email = 'user-email@example.com';

-- OPTION 4: View all users and their admin status
SELECT id, email, full_name, is_admin, created_at 
FROM profiles 
ORDER BY created_at DESC;
