import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { QuickRecommendations } from "@/components/dashboard/quick-recommendations"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch portfolio data
  const { data: portfolio } = await supabase
    .from("portfolio")
    .select(`
      *,
      investment:investments(*)
    `)
    .eq("user_id", user.id)

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      investment:investments(name, category)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recommendations
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select(`
      *,
      investment:investments(*)
    `)
    .eq("user_id", user.id)
    .eq("is_viewed", false)
    .order("score", { ascending: false })
    .limit(3)

  // Calculate stats
  const totalInvested = portfolio?.reduce((sum, p) => sum + p.amount * p.purchase_price, 0) || 0
  const totalValue = portfolio?.reduce((sum, p) => sum + p.current_value, 0) || 0
  const totalReturn = totalValue - totalInvested
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  const stats = {
    totalInvested,
    totalValue,
    totalReturn,
    returnPercentage,
    portfolioCount: portfolio?.length || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your investment overview.</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioChart portfolio={portfolio || []} />
        <QuickRecommendations recommendations={recommendations || []} />
      </div>

      <RecentTransactions transactions={transactions || []} />
    </div>
  )
}
