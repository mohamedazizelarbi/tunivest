# Admin Account Setup - Testing & Verification

## Step 1: Verify Database Setup ✅

Run this query in Supabase SQL Editor to confirm the admin account is properly configured:

```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_admin,
  CASE WHEN up.completed_at IS NOT NULL THEN 'Completed' ELSE 'Pending' END as onboarding_status
FROM profiles p
LEFT JOIN user_profile up ON p.id = up.user_id
WHERE p.email = 'admin67@gmail.com';
```

**Expected Result:**
```
id          | email             | full_name  | is_admin | onboarding_status
------------|-------------------|------------|----------|------------------
[uuid]      | admin67@gmail.com  | Admin User | true     | Completed
```

✅ **If you see this:** The database is set up correctly. Move to Step 2.

❌ **If query returns no rows:**
- The auth user doesn't exist yet
- Run: `node scripts/create_admin_account.js` to create it
- Or manually create user in Supabase Auth dashboard

---

## Step 2: Test Authentication 🔐

1. **Stop the dev server** if it's running (Ctrl+C)
2. **Start it fresh:**
   ```bash
   npm run dev
   ```
3. **Navigate to:** `http://localhost:3000/auth/login`
4. **Sign in with:**
   - Email: `admin67@gmail.com`
   - Password: `676767scuba`

**Expected Behavior:**
- ✅ Login succeeds (no error message)
- ✅ Automatically redirects to `/admin`
- ✅ Dashboard loads with KPI cards

**If you get errors:**

| Error | Solution |
|-------|----------|
| "Invalid login credentials" | Password is wrong, or auth user not created. Run Node.js script. |
| "User not found" | Auth user doesn't exist. Run Node.js script: `node scripts/create_admin_account.js` |
| Redirects to `/onboarding` | Onboarding not marked complete. Run SQL Step 2 from `create_admin_account.sql` |
| "Access Denied" on `/admin` | `is_admin` is false in database. Run SQL Step 1 from `create_admin_account.sql` |

---

## Step 3: Verify Admin Features 📊

Once logged in at `/admin`, check these pages load correctly:

| Page | URL | Expected Content |
|------|-----|------------------|
| Dashboard | `/admin` | KPI cards (Users, Investments, Simulations, Popular Investment) |
| Users | `/admin/users` | Table of all users with email, name, created date |
| Investments | `/admin/investments` | Table with Create, Edit, Delete buttons |
| Analytics | `/admin/analytics` | Charts showing user distribution, portfolio breakdown, registration trends |
| AI Settings | `/admin/ai-settings` | Zapier integration information |

**Quick test:**
1. Click **Investments** in sidebar
2. Click **+ New Investment** button
3. Fill in form:
   - Name: "Test Investment"
   - Category: "stocks"
   - Risk Level: 5
   - Min Amount: 1000
   - Expected Return: 12
   - Duration: 12 months
4. Click **Create**

✅ **If you see:** "Investment created successfully" toast and new row in table = Success!

---

## Step 4: Verify Non-Admin Cannot Access 👤

1. **Create a test non-admin user:**
   - Go to `/auth/sign-up`
   - Register with any email: `testuser@example.com`
   - Complete onboarding normally

2. **Try accessing `/admin`:**
   - Should redirect to `/dashboard` or `/auth/login`

✅ **If redirected:** Authorization is working correctly!

---

## Summary of What's Setup

### ✅ Completed
- Auth user created: `admin67@gmail.com` / `676767scuba`
- Email verified (no confirmation needed)
- Admin flag set in database (`is_admin = true`)
- Onboarding completed (can bypass signup flow)
- Risk profile configured (analyst, high risk tolerance)

### ✅ Ready to Test
- Login at `/auth/login`
- Admin dashboard at `/admin`
- Investment CRUD operations
- Analytics and charts
- Role-based access control

### 📋 Related Files
- `scripts/create_admin_account.js` — Automated setup (Node.js)
- `scripts/create_admin_account.sql` — Manual setup (SQL)
- `scripts/verify_admin_account.sql` — Verification query
- `ADMIN_ACCOUNT_SETUP.md` — Detailed setup guide
- `lib/supabase/admin.ts` — Authorization helper
- `app/admin/` — Admin dashboard routes

---

## Troubleshooting Checklist

- [ ] Database query shows `is_admin = true`
- [ ] Database query shows `onboarding_status = Completed`
- [ ] Can sign in with admin67@gmail.com / 676767scuba
- [ ] Automatically redirect to /admin on login
- [ ] Admin dashboard loads without errors
- [ ] Can view Users page
- [ ] Can view Investments page
- [ ] Can create/edit/delete investments
- [ ] Can view Analytics page with charts
- [ ] Can view AI Settings page
- [ ] Non-admin users cannot access /admin

---

## Getting Help

If something doesn't work:

1. **Check browser console:** Press F12, look for errors
2. **Check terminal output:** Look for server-side errors
3. **Clear cache:** Ctrl+Shift+Delete, then hard refresh (Ctrl+Shift+R)
4. **Check database:** Run `verify_admin_account.sql` query
5. **Check auth user exists:** Go to Supabase dashboard → Authentication → Users

**Contact:** If issues persist, check the codebase error logs and admin helper logic in `lib/supabase/admin.ts`.
