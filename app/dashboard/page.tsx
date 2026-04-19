import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { QuickRecommendations } from "@/components/dashboard/quick-recommendations"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReadableDuration, getReadableRiskTolerance } from "@/lib/onboarding"
import type { RiskTolerance } from "@/lib/types"
import { Sparkles } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const { data: userProfile } = await supabase
    .from("user_profile")
    .select("budget_min_tnd, budget_max_tnd, risk_tolerance, investment_duration")
    .eq("user_id", user.id)
    .maybeSingle()

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
        <p className="text-muted-foreground">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}! Here&apos;s your investment overview.
        </p>
      </div>

      <Card className="border-border bg-gradient-to-r from-primary/10 via-secondary/10 to-background">
        <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
              <p className="text-base font-semibold text-foreground">
                {userProfile
                  ? `${Number(userProfile.budget_min_tnd).toLocaleString()} - ${Number(userProfile.budget_max_tnd).toLocaleString()} TND`
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk tolerance</p>
              <p className="text-base font-semibold text-foreground">
                {userProfile?.risk_tolerance
                  ? getReadableRiskTolerance(userProfile.risk_tolerance as RiskTolerance)
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Investment duration</p>
              <p className="text-base font-semibold text-foreground">
                {userProfile?.investment_duration
                  ? getReadableDuration(userProfile.investment_duration)
                  : "Not set"}
              </p>
            </div>
          </div>

          <Link href="/dashboard/recommendations">
            <Button className="w-full gap-2 sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Get AI Recommendation
            </Button>
          </Link>
        </CardContent>
      </Card>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioChart portfolio={portfolio || []} />
        <QuickRecommendations recommendations={recommendations || []} />
      </div>

      <RecentTransactions transactions={transactions || []} />
    </div>
  )
}
