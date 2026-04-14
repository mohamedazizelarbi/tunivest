import { createClient } from "@/lib/supabase/server"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentUsersTable } from "@/components/admin/recent-users-table"
import { RecentTransactionsTable } from "@/components/admin/recent-transactions-table"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get user count
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Get investment count
  const { count: investmentCount } = await supabase
    .from("investments")
    .select("*", { count: "exact", head: true })

  // Get transaction stats
  const { data: transactions } = await supabase
    .from("transactions")
    .select("total_value, type")

  const totalVolume = transactions?.reduce((sum, t) => sum + t.total_value, 0) || 0

  // Get recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(`
      *,
      investment:investments(name),
      profile:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = {
    totalUsers: userCount || 0,
    totalInvestments: investmentCount || 0,
    totalTransactions: transactions?.length || 0,
    totalVolume,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your platform and monitor activity</p>
      </div>

      <AdminStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentUsersTable users={recentUsers || []} />
        <RecentTransactionsTable transactions={recentTransactions || []} />
      </div>
    </div>
  )
}
