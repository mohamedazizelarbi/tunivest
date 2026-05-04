#!/usr/bin/env node

/**
 * Admin Account Setup Script for TuniVest
 * 
 * This script creates a verified admin account using Supabase Admin API
 * Prerequisites:
 * - SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables set
 * - Node.js installed
 * 
 * Usage:
 * node scripts/create_admin_account.js
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Error: Missing environment variables");
  console.error("Please set:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdminAccount() {
  const email = "admin67@gmail.com";
  const password = "676767scuba";

  try {
    console.log("🚀 Creating admin account...");
    console.log(`   Email: ${email}`);

    // Step 1: Create auth user with Supabase Admin API
    console.log("\n1️⃣  Creating authentication user...");
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Mark email as verified
      user_metadata: {
        is_admin: true,
      },
    });

    if (authError) {
      console.error("❌ Auth creation failed:", authError.message);
      process.exit(1);
    }

    if (!authUser.user) {
      console.error("❌ No user returned from auth creation");
      process.exit(1);
    }

    const userId = authUser.user.id;
    console.log(`✅ Auth user created: ${userId}`);

    // Step 2: Update profile to set admin
    console.log("\n2️⃣  Setting admin privileges...");
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        is_admin: true,
        full_name: "Admin User",
      })
      .eq("id", userId);

    if (profileError) {
      console.error("❌ Profile update failed:", profileError.message);
      process.exit(1);
    }

    console.log("✅ Admin privileges set");

    // Step 3: Create completed onboarding profile
    console.log("\n3️⃣  Completing onboarding...");
    const { error: onboardingError } = await adminClient
      .from("user_profile")
      .insert({
        user_id: userId,
        personality_type: "analyst",
        age_range: "26_35",
        employment_status: "employed",
        monthly_income_range: "gt_3000",
        savings_range: "gt_5000",
        risk_tolerance: "high",
        investment_knowledge: "advanced",
        primary_goal: "maximize_profits",
        investment_duration: "long",
        preferences: ["stocks", "crypto", "real_estate"],
        budget_min_tnd: 5000,
        budget_max_tnd: 50000,
        completed_at: new Date().toISOString(),
      });

    if (onboardingError) {
      console.error("❌ Onboarding setup failed:", onboardingError.message);
      process.exit(1);
    }

    console.log("✅ Onboarding completed");

    // Step 4: Verify setup
    console.log("\n4️⃣  Verifying account...");
    const { data: profile, error: verifyError } = await adminClient
      .from("profiles")
      .select("id, email, full_name, is_admin, created_at")
      .eq("id", userId)
      .single();

    if (verifyError) {
      console.error("❌ Verification failed:", verifyError.message);
      process.exit(1);
    }

    console.log("✅ Account verified");
    console.log("\n✨ Admin account successfully created!");
    console.log("\n📋 Account Details:");
    console.log(`   Email: ${profile.email}`);
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Admin: ${profile.is_admin ? "Yes" : "No"}`);
    console.log(`   User ID: ${profile.id}`);
    console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);

    console.log("\n🚀 You can now sign in at: /auth/login");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    console.log("\n📊 Access the admin dashboard at: /admin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

createAdminAccount();
