import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard"
import { getCurrentUserProfile } from "@/lib/supabase/admin"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const effectiveProfile = await getCurrentUserProfile()

  if (effectiveProfile?.is_admin) {
    redirect("/admin")
  }

  const { data: onboarding } = await supabase
    .from("user_profile")
    .select("completed_at")
    .eq("user_id", user.id)
    .maybeSingle()

  if (onboarding?.completed_at) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <OnboardingWizard fullName={effectiveProfile?.full_name ?? null} />
      </div>
    </div>
  )
}
