import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AdminStats } from "@/lib/types"
import { Users, Briefcase, History, DollarSign } from "lucide-react"

interface AdminStatsProps {
  stats: AdminStats
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered investors",
    },
    {
      title: "Active Investments",
      value: stats.totalInvestments.toLocaleString(),
      icon: Briefcase,
      description: "Available products",
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: History,
      description: "All time trades",
    },
    {
      title: "Total Volume",
      value: `${stats.totalVolume.toLocaleString()} TND`,
      icon: DollarSign,
      description: "Trading volume",
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
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
