import { createClient } from "@/lib/supabase/server"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentUsersTable } from "@/components/admin/recent-users-table"
import { RecentTransactionsTable } from "@/components/admin/recent-transactions-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAdminAuth } from "@/lib/supabase/admin"

export default async function AdminDashboardPage() {
  await requireAdminAuth()
  const supabase = await createClient()

  // Get user count
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Get investment count (active only)
  const { count: investmentCount } = await supabase
    .from("investments")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  // Get simulation count
  const { count: simulationCount } = await supabase
    .from("simulations")
    .select("*", { count: "exact", head: true })

  // Get most popular investment (by portfolio selections)
  const { data: portfolioStats } = await supabase
    .from("portfolio")
    .select("investment_id, investment:investments(name)")
    .limit(1000)

  const investmentCounts = portfolioStats?.reduce((acc, item) => {
    if (item.investment_id) {
      acc[item.investment_id] = (acc[item.investment_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  const mostPopularId = Object.entries(investmentCounts).sort(([, a], [, b]) => b - a)[0]?.[0]
  const mostPopularInvestment = portfolioStats?.find(p => p.investment_id === mostPopularId)?.investment?.name
  const mostPopularCount = mostPopularId ? investmentCounts[mostPopularId] : 0

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
    totalSimulations: simulationCount || 0,
    mostPopularInvestment: mostPopularInvestment || undefined,
    mostPopularCount,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform activity and key metrics</p>
      </div>

      <AdminStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentUsersTable users={recentUsers || []} />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactionsTable transactions={recentTransactions || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
