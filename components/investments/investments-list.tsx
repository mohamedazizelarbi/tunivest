"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Investment } from "@/lib/types"
import { TrendingUp, Clock, AlertTriangle, ArrowRight } from "lucide-react"

interface InvestmentsListProps {
  investments: Investment[]
  isLoggedIn: boolean
}

const categoryLabels: Record<string, string> = {
  bonds: "Bonds",
  stocks: "Stocks",
  funds: "Mutual Funds",
  real_estate: "Real Estate",
  crypto: "Cryptocurrency",
}

const getRiskColor = (risk: number) => {
  if (risk <= 3) return "bg-green-100 text-green-800"
  if (risk <= 6) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

const getRiskLabel = (risk: number) => {
  if (risk <= 3) return "Low Risk"
  if (risk <= 6) return "Medium Risk"
  return "High Risk"
}

export function InvestmentsList({ investments, isLoggedIn }: InvestmentsListProps) {
  if (investments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No investments available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {investments.length} investment{investments.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {investments.map((investment) => (
          <Card key={investment.id} className="border-border transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-foreground">{investment.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {categoryLabels[investment.category] || investment.category}
                  </CardDescription>
                </div>
                <Badge className={getRiskColor(investment.risk_level)}>
                  {getRiskLabel(investment.risk_level)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {investment.description}
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Expected Return
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    {investment.expected_return}%
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Duration
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {investment.duration_months} mo.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" />
                    Risk Level
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {investment.risk_level}/10
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Minimum Investment</p>
                <p className="text-lg font-bold text-primary">
                  {investment.min_amount.toLocaleString()} TND
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {isLoggedIn ? (
                <Link href={`/dashboard/invest/${investment.id}`} className="w-full">
                  <Button className="w-full gap-2">
                    Invest Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/sign-up" className="w-full">
                  <Button className="w-full gap-2">
                    Sign Up to Invest
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
