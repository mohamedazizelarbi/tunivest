import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { requireAdminAuth } from "@/lib/supabase/admin"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAdminAuth()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar profile={profile} />
      <main className="flex-1 bg-muted/30 p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
