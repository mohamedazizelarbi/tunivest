"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

const categories = [
  { id: "bonds", label: "Bonds" },
  { id: "stocks", label: "Stocks" },
  { id: "funds", label: "Mutual Funds" },
  { id: "real_estate", label: "Real Estate" },
  { id: "crypto", label: "Cryptocurrency" },
]

const riskLevels = [
  { id: "low", label: "Low Risk (1-3)" },
  { id: "medium", label: "Medium Risk (4-6)" },
  { id: "high", label: "High Risk (7-10)" },
]

export function InvestmentFilters() {
  const [minAmount, setMinAmount] = useState([0])

  return (
    <Card className="sticky top-24 border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel className="text-sm font-medium">Category</FieldLabel>
            <div className="mt-2 space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox id={category.id} />
                  <label
                    htmlFor={category.id}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel className="text-sm font-medium">Risk Level</FieldLabel>
            <div className="mt-2 space-y-2">
              {riskLevels.map((level) => (
                <div key={level.id} className="flex items-center gap-2">
                  <Checkbox id={level.id} />
                  <label
                    htmlFor={level.id}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {level.label}
                  </label>
                </div>
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel className="text-sm font-medium">
              Min. Investment: {minAmount[0].toLocaleString()} TND
            </FieldLabel>
            <div className="mt-4 px-1">
              <Slider
                value={minAmount}
                onValueChange={setMinAmount}
                max={50000}
                step={500}
                className="w-full"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>0 TND</span>
              <span>50,000 TND</span>
            </div>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
