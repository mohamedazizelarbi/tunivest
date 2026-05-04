import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { requireAdminAuth } from "@/lib/supabase/admin"
import { StatCard } from "@/components/admin/admin-stats"
import { Users, Briefcase, Zap, TrendingUp } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export default async function AdminAnalyticsPage() {
  await requireAdminAuth()
  const supabase = await createClient()

  // Get user count
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Get portfolio count
  const { count: portfolioCount } = await supabase
    .from("portfolio")
    .select("*", { count: "exact", head: true })

  // Get simulation count
  const { count: simulationCount } = await supabase
    .from("simulations")
    .select("*", { count: "exact", head: true })

  // Get most selected investment
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

  const mostSelectedId = Object.entries(investmentCounts).sort(([, a], [, b]) => b - a)[0]?.[0]
  const mostSelectedInvestment = portfolioStats?.find(p => p.investment_id === mostSelectedId)?.investment?.name
  const mostSelectedCount = mostSelectedId ? investmentCounts[mostSelectedId] : 0

  // Get data for charts
  const { data: users } = await supabase
    .from("profiles")
    .select("created_at, risk_profile")

  const { data: portfolios } = await supabase
    .from("portfolio")
    .select(`
      current_value,
      investment:investments(category)
    `)

  // Calculate risk profile distribution
  const usersByRisk = users?.reduce((acc, u) => {
    acc[u.risk_profile] = (acc[u.risk_profile] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Calculate portfolio by category
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

  // Format chart data
  const riskData = Object.entries(usersByRisk).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color:
      name === "conservative"
        ? "hsl(142, 71%, 45%)"
        : name === "moderate"
          ? "hsl(48, 96%, 53%)"
          : "hsl(0, 84%, 60%)",
  }))

  const categoryLabels: Record<string, string> = {
    bonds: "Bonds",
    stocks: "Stocks",
    funds: "Funds",
    real_estate: "Real Estate",
    crypto: "Crypto",
  }

  const categoryData = Object.entries(portfolioByCategory).map(([name, value]) => ({
    name: categoryLabels[name] || name,
    value: Math.round(value),
  }))

  const signupData = Object.entries(monthlySignups).map(([month, count]) => ({
    month,
    users: count,
  }))

  const categoryColors = [
    "hsl(280, 60%, 50%)",
    "hsl(85, 60%, 55%)",
    "hsl(280, 50%, 60%)",
    "hsl(85, 50%, 65%)",
    "hsl(280, 40%, 70%)",
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
        <p className="text-muted-foreground">Platform performance and user statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground">Registered investors</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Portfolios
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{portfolioCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Simulations
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{simulationCount || 0}</div>
            <p className="text-xs text-muted-foreground">Investment simulations</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Selected
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground truncate">{mostSelectedInvestment || "—"}</div>
            {mostSelectedCount > 0 ? (
              <p className="text-xs text-green-600 font-medium">{mostSelectedCount} selections</p>
            ) : (
              <p className="text-xs text-muted-foreground">No selections yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Users by Risk Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {riskData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, "Users"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Portfolio by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} TND`, "Value"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Registrations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {signupData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={signupData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value, "New Users"]} />
                    <Bar dataKey="users" fill="hsl(280, 60%, 50%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Top Investment Selections</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(investmentCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(investmentCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([id, count], idx) => {
                    const invName = portfolioStats?.find(p => p.investment_id === id)?.investment?.name
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-muted-foreground">{idx + 1}.</div>
                          <div className="text-sm font-medium text-foreground truncate">
                            {invName || "Unknown"}
                          </div>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No selections yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
