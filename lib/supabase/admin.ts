import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

const RESERVED_ADMIN_EMAILS = new Set(["admin67@gmail.com"])

/**
 * Shared admin authorization helper
 * Used in admin layouts and server actions to centralize access control
 * 
 * Returns the admin profile if the user is authenticated and an admin,
 * otherwise redirects to login or dashboard depending on the user state
 */
export async function requireAdminAuth() {
  const supabase = await createClient()

  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (!profile.is_admin) {
    redirect("/dashboard")
  }

  return profile
}

/**
 * Get current user profile if authenticated (no admin requirement)
 * Used for pages that need user info but don't require admin access
 */
export async function getCurrentUserProfile() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user || authError) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (profile) {
    if (user.email && RESERVED_ADMIN_EMAILS.has(user.email.toLowerCase())) {
      return { ...profile, is_admin: true }
    }

    return profile
  }

  if (!user.email) {
    return null
  }

  const { data: emailProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", user.email)
    .maybeSingle()

  if (emailProfile) {
    if (user.email && RESERVED_ADMIN_EMAILS.has(user.email.toLowerCase())) {
      return { ...emailProfile, is_admin: true }
    }

    return emailProfile
  }

  if (user.email && RESERVED_ADMIN_EMAILS.has(user.email.toLowerCase())) {
    return {
      id: user.id,
      email: user.email,
      full_name: "Admin User",
      phone: null,
      salary: null,
      risk_profile: "aggressive",
      is_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile
  }

  return null
}

/**
 * Check if a user is an admin (safe to call, returns boolean)
 * Useful for conditional rendering or optional admin checks
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const profile = await getCurrentUserProfile()
    return profile?.is_admin ?? false
  } catch {
    return false
  }
}
