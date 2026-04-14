"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface ReportsChartsProps {
  usersByRisk: Record<string, number>
  transactionsByType: Record<string, number>
  portfolioByCategory: Record<string, number>
  monthlySignups: Record<string, number>
}

const RISK_COLORS = {
  conservative: "hsl(142, 71%, 45%)",
  moderate: "hsl(48, 96%, 53%)",
  aggressive: "hsl(0, 84%, 60%)",
}

const CATEGORY_COLORS = [
  "hsl(280, 60%, 50%)",
  "hsl(85, 60%, 55%)",
  "hsl(280, 50%, 60%)",
  "hsl(85, 50%, 65%)",
  "hsl(280, 40%, 70%)",
]

const TYPE_COLORS = {
  buy: "hsl(142, 71%, 45%)",
  sell: "hsl(0, 84%, 60%)",
  dividend: "hsl(217, 91%, 60%)",
  withdrawal: "hsl(32, 95%, 44%)",
}

const categoryLabels: Record<string, string> = {
  bonds: "Bonds",
  stocks: "Stocks",
  funds: "Funds",
  real_estate: "Real Estate",
  crypto: "Crypto",
}

export function ReportsCharts({
  usersByRisk,
  transactionsByType,
  portfolioByCategory,
  monthlySignups,
}: ReportsChartsProps) {
  const riskData = Object.entries(usersByRisk).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: RISK_COLORS[name as keyof typeof RISK_COLORS] || "#8884d8",
  }))

  const typeData = Object.entries(transactionsByType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: TYPE_COLORS[name as keyof typeof TYPE_COLORS] || "#8884d8",
  }))

  const categoryData = Object.entries(portfolioByCategory).map(([name, value]) => ({
    name: categoryLabels[name] || name,
    value,
  }))

  const signupData = Object.entries(monthlySignups).map(([month, count]) => ({
    month,
    users: count,
  }))

  return (
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
          <CardTitle className="text-foreground">Transaction Volume by Type</CardTitle>
        </CardHeader>
        <CardContent>
          {typeData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()} TND`, "Volume"]} />
                  <Bar dataKey="value">
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
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
          <CardTitle className="text-foreground">Portfolio Distribution</CardTitle>
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
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
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
          <CardTitle className="text-foreground">User Registrations</CardTitle>
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
    </div>
  )
}
