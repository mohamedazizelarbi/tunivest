import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/dashboard/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}
