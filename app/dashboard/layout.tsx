import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.is_admin) {
    redirect("/admin")
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 bg-muted/30 p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
