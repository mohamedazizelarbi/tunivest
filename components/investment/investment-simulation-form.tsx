"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock3, Loader2, TrendingUp } from "lucide-react"

export interface InvestmentDealPayload {
  id: string
  name: string
  description: string
  typeLabel: string
  currentPrice: number
  expectedReturn: number
  riskLevel: number
  chartSymbol: string
  portfolioInvestmentId: string
  portfolioInvestmentName: string
  isLiveMarket: boolean
  portfolioDealType: string
}

interface InvestmentSimulationFormProps {
  userId: string
  deal: InvestmentDealPayload
}

export function InvestmentSimulationForm({ userId, deal }: InvestmentSimulationFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [durationValue, setDurationValue] = useState("")
  const [durationUnit, setDurationUnit] = useState<"months" | "years">("months")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const investedAmount = Number(amount) || 0
  const durationNumber = Number(durationValue) || 0
  const durationMonths = durationValue ? (durationUnit === "years" ? durationNumber * 12 : durationNumber) : 12
  const estimatedReturn = useMemo(() => {
    if (investedAmount <= 0) return 0
    return investedAmount + (investedAmount * deal.expectedReturn) / 100
  }, [deal.expectedReturn, investedAmount])
  const profit = Math.max(0, estimatedReturn - investedAmount)
  const units = deal.currentPrice > 0 ? investedAmount / deal.currentPrice : 0

  const handleInvest = async () => {
    if (investedAmount <= 0) {
      setError("Enter a valid amount to simulate.")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: simulationError } = await supabase.from("simulations").insert({
      user_id: userId,
      investment_id: deal.portfolioInvestmentId,
      initial_amount: investedAmount,
      duration_months: durationMonths,
      projected_return: profit,
      projected_value: estimatedReturn,
    })

    if (simulationError) {
      setError(simulationError.message)
      setLoading(false)
      return
    }

    const { error: portfolioError } = await supabase.from("portfolio").upsert(
      {
        user_id: userId,
        investment_id: deal.portfolioInvestmentId,
        deal_key: deal.portfolioDealKey,
        display_name: deal.portfolioDisplayName,
        deal_type: deal.portfolioDealType,
        amount: units,
        purchase_price: deal.currentPrice,
        current_value: estimatedReturn,
      },
      { onConflict: "user_id,deal_key" },
    )

    if (portfolioError) {
      const missingDealColumns =
        portfolioError.message.includes("deal_key") ||
        portfolioError.message.includes("display_name") ||
        portfolioError.message.includes("deal_type") ||
        portfolioError.message.includes("schema cache")

      if (!missingDealColumns) {
        setError(portfolioError.message)
        setLoading(false)
        return
      }

      // Backward-compatible fallback when the migration has not been applied yet.
      const { error: legacyPortfolioError } = await supabase.from("portfolio").upsert(
        {
          user_id: userId,
          investment_id: deal.portfolioInvestmentId,
          amount: units,
          purchase_price: deal.currentPrice,
          current_value: estimatedReturn,
        },
        { onConflict: "user_id,investment_id" },
      )

      if (legacyPortfolioError) {
        setError(legacyPortfolioError.message)
        setLoading(false)
        return
      }
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  if (success) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">Simulation saved</h2>
          <p className="mt-2 text-muted-foreground">
            Your simulated position has been added to your portfolio and simulations history.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You can review it in your portfolio after this screen refreshes.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/portfolio">View Portfolio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">{deal.name}</CardTitle>
              <CardDescription>{deal.typeLabel}</CardDescription>
            </div>
            <Badge className={deal.isLiveMarket ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}>
              {deal.isLiveMarket ? "Live Market" : "Database Deal"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{deal.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <TrendingUp className="mx-auto h-5 w-5 text-green-600" />
              <p className="mt-2 text-xs text-muted-foreground">Expected Return</p>
              <p className="text-lg font-bold text-green-600">{deal.expectedReturn}%</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Clock3 className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Risk Level</p>
              <p className="text-lg font-bold text-foreground">{deal.riskLevel}/10</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <TrendingUp className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Current Price</p>
              <p className="text-lg font-bold text-foreground">{deal.currentPrice.toLocaleString()} TND</p>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Portfolio target</p>
            <p className="text-base font-semibold text-foreground">{deal.portfolioInvestmentName}</p>
            {deal.isLiveMarket ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Live market opportunities are simulated against a representative portfolio asset so they can be stored in your portfolio.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Simulation</CardTitle>
          <CardDescription>Estimate returns before saving the simulated position</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="space-y-4">
            {error ? (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Field>
              <FieldLabel htmlFor="amount">Amount to invest (TND)</FieldLabel>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                min={1}
                step="0.01"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="duration">Duration (optional)</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g. 12"
                  value={durationValue}
                  onChange={(event) => setDurationValue(event.target.value)}
                  min={1}
                  step={1}
                />
                <Select value={durationUnit} onValueChange={(value) => setDurationUnit(value as "months" | "years") }>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Field>

            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invested amount</span>
                <span className="font-medium text-foreground">{investedAmount.toLocaleString()} TND</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated return</span>
                <span className="font-medium text-foreground">{estimatedReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })} TND</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit</span>
                <span className="font-medium text-green-600">+{profit.toLocaleString(undefined, { maximumFractionDigits: 2 })} TND</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration saved</span>
                <span className="font-medium text-foreground">{durationValue ? `${durationMonths} months` : "12 months default"}</span>
              </div>
            </div>

            <Button type="button" onClick={handleInvest} disabled={loading || investedAmount <= 0} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving simulation...
                </>
              ) : (
                "Invest"
              )}
            </Button>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            This is a simulated investment only. No real trading is executed.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
