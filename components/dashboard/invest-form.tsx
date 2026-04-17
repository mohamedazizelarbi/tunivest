"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import type { Investment } from "@/lib/types"
import { TrendingUp, Clock, AlertTriangle, Loader2, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface InvestFormProps {
  investment: Investment
  userId: string
  userProfile: { salary: number | null; risk_profile: string } | null
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

export function InvestForm({ investment, userId, userProfile }: InvestFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const numAmount = parseFloat(amount) || 0
  const totalCost = numAmount * investment.min_amount
  const projectedReturn = totalCost * (investment.expected_return / 100) * (investment.duration_months / 12)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (totalCost < investment.min_amount) {
      setError(`Minimum investment is ${investment.min_amount.toLocaleString()} TND`)
      return
    }

    setLoading(true)

    const supabase = createClient()

    // Create transaction
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      investment_id: investment.id,
      type: "buy",
      amount: numAmount,
      price_per_unit: investment.min_amount,
      total_value: totalCost,
    })

    if (txError) {
      setError(txError.message)
      setLoading(false)
      return
    }

    // Add to portfolio or update existing
    const { data: existing } = await supabase
      .from("portfolio")
      .select("*")
      .eq("user_id", userId)
      .eq("investment_id", investment.id)
      .single()

    if (existing) {
      await supabase
        .from("portfolio")
        .update({
          amount: existing.amount + numAmount,
          current_value: existing.current_value + totalCost,
        })
        .eq("id", existing.id)
    } else {
      await supabase.from("portfolio").insert({
        user_id: userId,
        investment_id: investment.id,
        amount: numAmount,
        purchase_price: investment.min_amount,
        current_value: totalCost,
      })
    }

    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      router.push("/dashboard/portfolio")
      router.refresh()
    }, 2000)
  }

  if (success) {
    return (
      <Card className="border-border max-w-lg mx-auto">
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">Investment Successful!</h2>
          <p className="mt-2 text-muted-foreground">
            You have invested {totalCost.toLocaleString()} TND in {investment.name}.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Redirecting to your portfolio...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-foreground">{investment.name}</CardTitle>
              <CardDescription>
                {categoryLabels[investment.category] || investment.category}
              </CardDescription>
            </div>
            <Badge className={getRiskColor(investment.risk_level)}>
              {getRiskLabel(investment.risk_level)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{investment.description}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <TrendingUp className="mx-auto h-5 w-5 text-green-600" />
              <p className="mt-2 text-xs text-muted-foreground">Expected Return</p>
              <p className="text-lg font-bold text-green-600">{investment.expected_return}%</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Clock className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-bold text-foreground">{investment.duration_months} mo.</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <AlertTriangle className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Risk Level</p>
              <p className="text-lg font-bold text-foreground">{investment.risk_level}/10</p>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Minimum Investment</p>
            <p className="text-2xl font-bold text-primary">
              {investment.min_amount.toLocaleString()} TND
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Complete Purchase</CardTitle>
          <CardDescription>Enter the number of units you want to buy</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="amount">Number of Units</FieldLabel>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g. 5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={1}
                  step={1}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Each unit costs {investment.min_amount.toLocaleString()} TND
                </p>
              </Field>

              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Units</span>
                  <span className="font-medium text-foreground">{numAmount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per unit</span>
                  <span className="font-medium text-foreground">{investment.min_amount.toLocaleString()} TND</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total Cost</span>
                  <span className="text-xl font-bold text-primary">{totalCost.toLocaleString()} TND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projected Return</span>
                  <span className="font-medium text-green-600">+{projectedReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })} TND</span>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || numAmount <= 0}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Invest ${totalCost.toLocaleString()} TND`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By proceeding, you agree to our investment terms and conditions.
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
