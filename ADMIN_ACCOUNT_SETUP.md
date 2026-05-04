# Admin Account Setup - admin67@gmail.com

This guide explains how to set up the pre-configured admin account.

## Quick Setup (Recommended - 2 minutes)

### Option 1: Automatic Setup (Node.js)

**Prerequisites:**
- Node.js installed
- Environment variables configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Steps:**

1. **Set environment variables:**
   ```bash
   # In your terminal or .env.local file
   export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **Run the setup script:**
   ```bash
   node scripts/create_admin_account.js
   ```

3. **Done!** Account created with:
   - ✅ Email verified (no confirmation needed)
   - ✅ Admin privileges enabled
   - ✅ Onboarding completed
   - ✅ Risk profile set to "advanced"

### Option 2: Manual Setup (Supabase UI)

**Step 1: Create Auth User**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Fill in:
   - Email: `admin67@gmail.com`
   - Password: `676767scuba`
   - ✅ Check "Auto confirm user"
5. Click **Create User**

**Step 2: Run SQL Setup**
1. Go to **SQL Editor**
2. Copy and paste the SQL from `scripts/create_admin_account.sql`
3. Click **Run**
4. Verify the output shows the account is set up

## Account Credentials

```
Email:      admin67@gmail.com
Password:   676767scuba
Status:     ✅ Verified
Admin:      ✅ Yes
Onboarding: ✅ Complete
```

## Sign In

1. Go to `/auth/login`
2. Enter credentials:
   - Email: `admin67@gmail.com`
   - Password: `676767scuba`
3. You'll automatically redirect to `/admin`

## Admin Dashboard Access

Once signed in, you can access:

| Page | URL | Features |
|------|-----|----------|
| Dashboard | `/admin` | KPIs, recent activity, platform stats |
| Users | `/admin/users` | View all users, search, filter |
| Investments | `/admin/investments` | Create, edit, delete investments |
| Analytics | `/admin/analytics` | Charts, metrics, insights |
| AI Settings | `/admin/ai-settings` | Zapier integration config |

## What Gets Set Up

### Profile Table
- `is_admin`: TRUE
- `full_name`: "Admin User"
- `email`: "admin67@gmail.com"

### Onboarding Profile (user_profile table)
- `personality_type`: analyst
- `age_range`: 26_35
- `employment_status`: employed
- `risk_tolerance`: high
- `investment_knowledge`: advanced
- `primary_goal`: maximize_profits
- `budget`: 5,000 - 50,000 TND
- `investment_duration`: long
- `preferences`: stocks, crypto, real_estate
- `completed_at`: NOW() ✅

## Verify Setup

**SQL Query to check account:**
```sql
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
```

Expected result:
- `is_admin`: true
- `onboarding_status`: Completed

## Troubleshooting

### "User already exists" error
The account already exists in Supabase Auth. This is expected if you ran the script multiple times.

**Solution:** Use the manual SQL setup instead or skip auth creation.

### Can't sign in
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check email spelling: `admin67@gmail.com` (exact match)

### "Access Denied" on `/admin`
1. Verify `is_admin` is TRUE in profiles table
2. Sign out and sign back in
3. Check browser console for errors

### Onboarding still shows
1. Verify `user_profile.completed_at` is not NULL
2. Clear browser local storage
3. Hard refresh the page

## Changing Admin Password

If you need to change the password later:

1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Find `admin67@gmail.com`
4. Click the three dots menu → **Reset Password**
5. Copy the reset link and follow the flow

## Removing Admin Access

To demote this account:

```sql
UPDATE profiles 
SET is_admin = FALSE 
WHERE email = 'admin67@gmail.com';
```

## Security Notes

- ✅ Email is verified automatically
- ✅ Password is securely hashed in Supabase
- ✅ Admin access is enforced server-side
- ✅ Session tokens expire after 7 days
- ✅ All admin actions are protected by `requireAdminAuth()` helper

## Related Files

- `scripts/create_admin_account.js` — Node.js setup script
- `scripts/create_admin_account.sql` — SQL setup queries
- `lib/supabase/admin.ts` — Authorization helper
- `ADMIN_SETUP.md` — General admin setup guide
