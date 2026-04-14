"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Portfolio, Investment } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface PortfolioChartProps {
  portfolio: (Portfolio & { investment: Investment | null })[]
}

const COLORS = [
  "hsl(280, 60%, 50%)",
  "hsl(85, 60%, 55%)",
  "hsl(280, 50%, 60%)",
  "hsl(85, 50%, 65%)",
  "hsl(280, 40%, 70%)",
]

const categoryLabels: Record<string, string> = {
  bonds: "Bonds",
  stocks: "Stocks",
  funds: "Funds",
  real_estate: "Real Estate",
  crypto: "Crypto",
}

export function PortfolioChart({ portfolio }: PortfolioChartProps) {
  if (portfolio.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-center text-muted-foreground">
            No investments yet. Start building your portfolio!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group by category
  const categoryData = portfolio.reduce((acc, item) => {
    const category = item.investment?.category || "other"
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += item.current_value
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(categoryData).map(([category, value]) => ({
    name: categoryLabels[category] || category,
    value,
  }))

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} TND`, "Value"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
