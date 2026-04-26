"use client"

import { Suspense } from "react"
import Link from "next/link"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvestmentSimulationForm, type InvestmentDealPayload } from "@/components/investment/investment-simulation-form"

type InvestmentDetailClientPageProps = {
  userId: string
  deal: InvestmentDealPayload
  currency: string
}

function getEmbedUrl(symbol: string) {
  return `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=1&theme=dark&style=1&timezone=Africa/Tunis&withdateranges=1&hideideas=1&locale=en`
}

function TradingViewWidget({ chartSymbol, dealName }: { chartSymbol: string; dealName: string }) {
  if (!chartSymbol) {
    throw new Error("Invalid chart symbol provided for TradingView widget.")
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <iframe
        title={`${dealName} market chart`}
        src={getEmbedUrl(chartSymbol)}
        className="h-[420px] w-full"
        loading="lazy"
        allow="fullscreen"
      />
    </div>
  )
}

class WidgetBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-bold">Charting widget error</p>
          <p className="text-sm">{this.state.error?.message || "The chart could not be loaded."}</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default function InvestmentDetailClientPage({ userId, deal, currency }: InvestmentDetailClientPageProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary">{deal.typeLabel}</Badge>
            <Badge variant="outline">{deal.isLiveMarket ? "Live Market" : "Database Investment"}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">{deal.name}</h1>
          <p className="max-w-3xl text-muted-foreground">{deal.description}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/invest">Back to Opportunities</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Market Chart</CardTitle>
            <CardDescription>Live widget for the selected opportunity. This is informational only.</CardDescription>
          </CardHeader>
          <CardContent>
            <WidgetBoundary>
              <Suspense fallback={<div className="h-[420px] w-full animate-pulse rounded-lg bg-muted" />}>
                <TradingViewWidget chartSymbol={deal.chartSymbol} dealName={deal.name} />
              </Suspense>
            </WidgetBoundary>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Deal Snapshot</CardTitle>
            <CardDescription>Key details before you simulate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Minimum Amount</p>
                <p className="text-lg font-semibold text-foreground">
                  {deal.currentPrice.toLocaleString()} {currency}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Expected Return</p>
                <p className="text-lg font-semibold text-green-600">{deal.expectedReturn}%</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <p className="text-lg font-semibold text-foreground">{deal.riskLevel}/10</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="text-lg font-semibold text-foreground">{deal.typeLabel}</p>
              </div>
            </div>
            {deal.isLiveMarket && (
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                Live-feed opportunities are simulated and can be added to your portfolio.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InvestmentSimulationForm userId={userId} deal={deal} />
    </div>
  )
}
