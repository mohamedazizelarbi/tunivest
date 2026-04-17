"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import type { Investment } from "@/lib/types"
import { Calculator, TrendingUp, Clock, PiggyBank } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SimulatorFormProps {
  investments: Investment[]
  userId: string
}

export function SimulatorForm({ investments, userId }: SimulatorFormProps) {
  const [selectedInvestment, setSelectedInvestment] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [duration, setDuration] = useState<string>("")
  const [result, setResult] = useState<{
    projectedReturn: number
    projectedValue: number
    monthlyReturn: number
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const investment = investments.find(i => i.id === selectedInvestment)

  const handleSimulate = async () => {
    if (!investment || !amount || !duration) return

    setLoading(true)

    const initialAmount = parseFloat(amount)
    const months = parseInt(duration)
    const annualRate = investment.expected_return / 100
    const monthlyRate = annualRate / 12

    // Compound interest calculation
    const projectedValue = initialAmount * Math.pow(1 + monthlyRate, months)
    const projectedReturn = projectedValue - initialAmount
    const monthlyReturn = projectedReturn / months

    setResult({
      projectedReturn,
      projectedValue,
      monthlyReturn,
    })

    // Save simulation to database
    const supabase = createClient()
    await supabase.from("simulations").insert({
      user_id: userId,
      investment_id: selectedInvestment,
      initial_amount: initialAmount,
      duration_months: months,
      projected_return: projectedReturn,
      projected_value: projectedValue,
    })

    setLoading(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calculator className="h-5 w-5" />
            Simulation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>Select Investment</FieldLabel>
              <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an investment" />
                </SelectTrigger>
                <SelectContent>
                  {investments.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.name} ({inv.expected_return}% return)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Investment Amount (TND)</FieldLabel>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={investment?.min_amount || 0}
              />
              {investment && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum: {investment.min_amount.toLocaleString()} TND
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel>Duration (Months)</FieldLabel>
              <Input
                type="number"
                placeholder="e.g. 12"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min={1}
                max={investment?.duration_months || 60}
              />
              {investment && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Recommended: {investment.duration_months} months
                </p>
              )}
            </Field>

            <Button
              onClick={handleSimulate}
              disabled={!selectedInvestment || !amount || !duration || loading}
              className="w-full"
            >
              {loading ? "Calculating..." : "Calculate Returns"}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            Projected Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-primary/10 p-6 text-center">
                <p className="text-sm text-muted-foreground">Projected Final Value</p>
                <p className="text-4xl font-bold text-primary">
                  {result.projectedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} TND
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <TrendingUp className="mx-auto h-6 w-6 text-green-600" />
                  <p className="mt-2 text-xs text-muted-foreground">Total Return</p>
                  <p className="text-xl font-bold text-green-600">
                    +{result.projectedReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })} TND
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Monthly Avg.</p>
                  <p className="text-xl font-bold text-foreground">
                    +{result.monthlyReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })} TND
                  </p>
                </div>
              </div>

              {investment && (
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">{investment.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected annual return: {investment.expected_return}% | Risk level: {investment.risk_level}/10
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                * This is an estimate based on expected returns. Actual results may vary.
              </p>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <PiggyBank className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Fill in the parameters and click calculate to see your projected returns.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
