import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/types"
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Briefcase } from "lucide-react"

interface DashboardStatsProps {
  stats: DashboardStats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Invested",
      value: `${stats.totalInvested.toLocaleString()} TND`,
      icon: Wallet,
      description: "Your total capital",
    },
    {
      title: "Current Value",
      value: `${stats.totalValue.toLocaleString()} TND`,
      icon: PiggyBank,
      description: "Portfolio worth today",
    },
    {
      title: "Total Return",
      value: `${stats.totalReturn >= 0 ? "+" : ""}${stats.totalReturn.toLocaleString()} TND`,
      icon: stats.totalReturn >= 0 ? TrendingUp : TrendingDown,
      description: `${stats.returnPercentage >= 0 ? "+" : ""}${stats.returnPercentage.toFixed(2)}%`,
      positive: stats.totalReturn >= 0,
    },
    {
      title: "Active Investments",
      value: stats.portfolioCount.toString(),
      icon: Briefcase,
      description: "Diversified assets",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.positive !== undefined ? (stat.positive ? "text-green-600" : "text-red-600") : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.positive !== undefined ? (stat.positive ? "text-green-600" : "text-red-600") : "text-foreground"}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
