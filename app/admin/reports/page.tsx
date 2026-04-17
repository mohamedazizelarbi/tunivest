import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportsCharts } from "@/components/admin/reports-charts"

export default async function AdminReportsPage() {
  const supabase = await createClient()

  // Get user registration stats
  const { data: users } = await supabase
    .from("profiles")
    .select("created_at, risk_profile")

  // Get transaction stats
  const { data: transactions } = await supabase
    .from("transactions")
    .select("created_at, type, total_value")

  // Get portfolio stats
  const { data: portfolios } = await supabase
    .from("portfolio")
    .select(`
      current_value,
      investment:investments(category)
    `)

  // Calculate stats
  const usersByRisk = users?.reduce((acc, u) => {
    acc[u.risk_profile] = (acc[u.risk_profile] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const transactionsByType = transactions?.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.total_value
    return acc
  }, {} as Record<string, number>) || {}

  const portfolioByCategory = portfolios?.reduce((acc, p) => {
    const category = p.investment?.category || "other"
    acc[category] = (acc[category] || 0) + p.current_value
    return acc
  }, {} as Record<string, number>) || {}

  // Monthly user signups
  const monthlySignups = users?.reduce((acc, u) => {
    const month = new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Reports & Analytics</h1>
        <p className="text-muted-foreground">Platform statistics and performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{transactions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {(transactions?.reduce((sum, t) => sum + t.total_value, 0) || 0).toLocaleString()} TND
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(portfolios?.reduce((sum, p) => sum + p.current_value, 0) || 0).toLocaleString()} TND
            </div>
          </CardContent>
        </Card>
      </div>

      <ReportsCharts
        usersByRisk={usersByRisk}
        transactionsByType={transactionsByType}
        portfolioByCategory={portfolioByCategory}
        monthlySignups={monthlySignups}
      />
    </div>
  )
}
