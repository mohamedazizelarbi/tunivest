import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Zap, TrendingUp } from "lucide-react"

interface AdminStatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  subValue?: string
}

export function StatCard({ title, value, icon, description, subValue }: AdminStatsCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subValue && (
          <p className="mt-1 text-xs text-green-600 font-medium">{subValue}</p>
        )}
        {description && !subValue && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface AdminStatsProps {
  stats: {
    totalUsers?: number
    totalInvestments?: number
    totalSimulations?: number
    mostPopularInvestment?: string
    mostPopularCount?: number
    totalTransactions?: number
    totalVolume?: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() || "0",
      icon: <Users className="h-4 w-4" />,
      description: "Active investors",
    },
    {
      title: "Investments Available",
      value: stats.totalInvestments?.toLocaleString() || "0",
      icon: <Briefcase className="h-4 w-4" />,
      description: "Active products",
    },
    {
      title: "Simulated Investments",
      value: stats.totalSimulations?.toLocaleString() || "0",
      icon: <Zap className="h-4 w-4" />,
      description: "Total simulations",
    },
    {
      title: "Most Popular Investment",
      value: stats.mostPopularInvestment || "—",
      icon: <TrendingUp className="h-4 w-4" />,
      subValue: stats.mostPopularCount ? `${stats.mostPopularCount} selections` : undefined,
      description: stats.mostPopularCount ? undefined : "No selections yet",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
