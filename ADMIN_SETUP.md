# Admin Account Setup Guide

This guide explains how to create and access the admin dashboard for TuniVest.

## Quick Start

### Step 1: Create a User Account

Visit your app at the signup page (`/auth/sign-up`) and create an account with:
- **Email**: `admin@tunivest.tn` (or any email you prefer)
- **Password**: Create a strong password
- **Full Name**: Admin (or your name)
- Complete the onboarding profile

### Step 2: Promote User to Admin

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL:

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'admin@tunivest.tn';
```

4. Click **Run** (or press Ctrl+Enter)

### Step 3: Sign In to Admin Dashboard

1. Sign out if already logged in
2. Go to `/auth/login`
3. Enter your admin credentials
4. You'll automatically redirect to `/admin`

## Admin Dashboard Features

Once logged in as an admin, you can access:

- **Dashboard** (`/admin`) — Platform KPIs and recent activity
- **Users** (`/admin/users`) — View all registered users
- **Investments** (`/admin/investments`) — Full CRUD: create, edit, delete investments
- **Analytics** (`/admin/analytics`) — Charts and platform metrics
- **AI Settings** (`/admin/ai-settings`) — AI recommendation configuration

## Verify Admin Status

To check if a user is an admin, run this SQL:

```sql
SELECT id, email, full_name, is_admin, created_at 
FROM profiles 
WHERE is_admin = TRUE
ORDER BY created_at DESC;
```

## Remove Admin Access

If you need to demote an admin user back to regular user:

```sql
UPDATE profiles 
SET is_admin = FALSE 
WHERE email = 'admin@tunivest.tn';
```

## Troubleshooting

### "Access Denied" when accessing `/admin`
- Verify the user is marked as `is_admin = TRUE` in the profiles table
- Sign out and sign back in to refresh the session
- Check that you're using the correct email

### Admin features not showing
- Clear your browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Try a different browser

### SQL script didn't work
- Ensure you're running the script in Supabase SQL Editor
- Check that the email address matches exactly (including case)
- Verify the query returned "1 row updated" confirmation

## Database Schema

The admin access is controlled by the `is_admin` boolean field in the `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  -- ... other fields
);
```

## Security Notes

- Only promote trusted users to admin
- Admin users can create, edit, and delete investments
- Admin users can view all user data
- Admin access is enforced server-side via `requireAdminAuth()` helper
- Row Level Security (RLS) policies protect data based on admin status

## Files Related to Admin Setup

- `lib/supabase/admin.ts` — Authorization helper with `requireAdminAuth()` function
- `app/admin/layout.tsx` — Admin route protection
- `app/admin/investments/actions.ts` — Investment CRUD server actions
- `scripts/admin_setup.sql` — Setup script (this file)
