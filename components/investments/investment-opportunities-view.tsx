"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { Bell, Building2, Globe2, Leaf, Plus, Search, Sparkles, Sun, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface PublicOpportunity {
  id: string
  name: string
  symbol: string
  description: string
  source: "bvmt" | "crypto" | "global"
  sourceLabel: string
  segmentLabel: string
  budgetBand: string
  currency: "TND" | "USD"
  expectedReturn: number
  minAmount: number
  riskLevel: number
  riskBand: "LOW" | "MEDIUM" | "HIGH"
  marketMove: number
  activityValue: number
  themeTag: string
}

export interface PublicAIRecommendation {
  score: number
  title: string
  message: string
  highlightedName?: string
}

export interface PublicMarketSnapshot {
  marketIndexLabel: string
  marketIndexDelta: number
  totalLiquidity: number
  activeProjects: number
  targetFillPercent: number
}

interface InvestmentOpportunitiesViewProps {
  opportunities: PublicOpportunity[]
  isLoggedIn: boolean
  aiRecommendation: PublicAIRecommendation
  marketSnapshot: PublicMarketSnapshot
}

const riskFilters = ["All", "LOW", "MEDIUM", "HIGH"]

const iconByType: Record<string, LucideIcon> = {
  bvmt: Building2,
  crypto: Sun,
  global: Globe2,
}

function formatAmount(value: number, currency: PublicOpportunity["currency"]) {
  if (currency === "USD") {
    return `$${Math.round(value).toLocaleString()}`
  }

  return `${Math.round(value).toLocaleString()} TND`
}

function formatCompact(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  return Math.round(value).toLocaleString()
}

function getRiskTone(riskBand: PublicOpportunity["riskBand"]) {
  if (riskBand === "LOW") return "bg-emerald-100 text-emerald-700"
  if (riskBand === "MEDIUM") return "bg-amber-100 text-amber-700"
  return "bg-rose-100 text-rose-700"
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right))
}

export function InvestmentOpportunitiesView({
  opportunities,
  isLoggedIn,
  aiRecommendation,
  marketSnapshot,
}: InvestmentOpportunitiesViewProps) {
  const [searchValue, setSearchValue] = useState("")
  const [activeSource, setActiveSource] = useState("All Sources")
  const [activeSegment, setActiveSegment] = useState("All Segments")
  const [activeBudget, setActiveBudget] = useState("All Budgets")
  const [activeRisk, setActiveRisk] = useState("All")

  const deferredSearch = useDeferredValue(searchValue)

  const opportunitiesForActiveSource = useMemo(() => {
    if (activeSource === "All Sources") return opportunities
    return opportunities.filter((item) => item.sourceLabel === activeSource)
  }, [activeSource, opportunities])

  const sourceFilters = useMemo(() => ["All Sources", ...uniqueSorted(opportunities.map((item) => item.sourceLabel))], [opportunities])
  const segmentFilters = useMemo(
    () => ["All Segments", ...uniqueSorted(opportunitiesForActiveSource.map((item) => item.segmentLabel))],
    [opportunitiesForActiveSource]
  )
  const budgetFilters = useMemo(
    () => ["All Budgets", ...uniqueSorted(opportunitiesForActiveSource.map((item) => item.budgetBand))],
    [opportunitiesForActiveSource]
  )

  useEffect(() => {
    if (!segmentFilters.includes(activeSegment)) {
      setActiveSegment("All Segments")
    }
  }, [activeSegment, segmentFilters])

  useEffect(() => {
    if (!budgetFilters.includes(activeBudget)) {
      setActiveBudget("All Budgets")
    }
  }, [activeBudget, budgetFilters])

  const filteredOpportunities = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase()

    return opportunities.filter((item) => {
      const searchTarget = `${item.name} ${item.symbol} ${item.description} ${item.sourceLabel} ${item.segmentLabel}`.toLowerCase()
      const matchesSearch = normalizedSearch.length === 0 || searchTarget.includes(normalizedSearch)
      const matchesSource = activeSource === "All Sources" || item.sourceLabel === activeSource
      const matchesSegment = activeSegment === "All Segments" || item.segmentLabel === activeSegment
      const matchesBudget = activeBudget === "All Budgets" || item.budgetBand === activeBudget
      const matchesRisk = activeRisk === "All" || item.riskBand === activeRisk

      return matchesSearch && matchesSource && matchesSegment && matchesBudget && matchesRisk
    })
  }, [activeBudget, activeRisk, activeSegment, activeSource, deferredSearch, opportunities])

  const sourceCounts = useMemo(() => {
    return opportunities.reduce<Record<string, number>>((counts, item) => {
      counts[item.sourceLabel] = (counts[item.sourceLabel] || 0) + 1
      return counts
    }, {})
  }, [opportunities])

  const segmentCounts = useMemo(() => {
    return opportunitiesForActiveSource.reduce<Record<string, number>>((counts, item) => {
      counts[item.segmentLabel] = (counts[item.segmentLabel] || 0) + 1
      return counts
    }, {})
  }, [opportunitiesForActiveSource])

  const budgetCounts = useMemo(() => {
    return opportunitiesForActiveSource.reduce<Record<string, number>>((counts, item) => {
      counts[item.budgetBand] = (counts[item.budgetBand] || 0) + 1
      return counts
    }, {})
  }, [opportunitiesForActiveSource])

  const hasActiveFilters =
    searchValue.length > 0 ||
    activeSource !== "All Sources" ||
    activeSegment !== "All Segments" ||
    activeBudget !== "All Budgets" ||
    activeRisk !== "All"

  const clearFilters = () => {
    setSearchValue("")
    setActiveSource("All Sources")
    setActiveSegment("All Segments")
    setActiveBudget("All Budgets")
    setActiveRisk("All")
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search BVMT, crypto, or global market assets..."
              className="h-11 rounded-full border-border/70 bg-background pl-9"
            />
          </div>

          <div className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
            {filteredOpportunities.length} of {opportunities.length} opportunities
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters ? (
            <Button variant="outline" className="h-11 rounded-full border-border/70 px-4" onClick={clearFilters}>
              Reset Filters
            </Button>
          ) : null}

          <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-border/70">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </header>

      <section className="space-y-5 rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 p-6 sm:p-8">
        <Badge className="w-fit rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          Oracle Risk Logic
        </Badge>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Investment Opportunities
            </h1>
            <p className="max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
              Live BVMT and CoinMarketCap data are normalized into one feed so the filter state stays instant while the data source can be swapped later.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full border-border/70 px-5">
              Export Report
            </Button>
            <Button className="rounded-full px-5 shadow-lg shadow-primary/20">
              Risk Insights
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">{aiRecommendation.title}</h2>
              <p className="text-sm text-muted-foreground">
                {aiRecommendation.message} {aiRecommendation.highlightedName ? <span className="font-semibold text-primary">{aiRecommendation.highlightedName}</span> : null}
              </p>
            </div>
          </div>

          <Button variant="outline" className="rounded-full border-border/70 px-5">
            View Match ({aiRecommendation.score}%)
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {sourceFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveSource(filter)
                setActiveSegment("All Segments")
                setActiveBudget("All Budgets")
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                activeSource === filter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {filter}
              {filter !== "All Sources" ? <span className="ml-1 opacity-70">({sourceCounts[filter] || 0})</span> : null}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {segmentFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveSegment(filter)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                activeSegment === filter
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {filter}
              {filter !== "All Segments" ? <span className="ml-1 opacity-70">({segmentCounts[filter] || 0})</span> : null}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {budgetFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveBudget(filter)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                activeBudget === filter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {filter}
              {filter !== "All Budgets" ? <span className="ml-1 opacity-70">({budgetCounts[filter] || 0})</span> : null}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {riskFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveRisk(filter)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                activeRisk === filter
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {filteredOpportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No opportunities match your current filters.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredOpportunities.map((opportunity) => {
              const TypeIcon = iconByType[opportunity.source] || Leaf

              return (
                <article
                  key={opportunity.id}
                  className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-[0_14px_35px_-22px_hsl(var(--foreground)/0.25)] transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", getRiskTone(opportunity.riskBand))}>
                        {opportunity.riskBand} RISK
                      </span>
                      <Badge variant="outline" className="rounded-full border-border/70 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {opportunity.sourceLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">{opportunity.name}</h3>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{opportunity.description}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <span>{opportunity.segmentLabel.replace("_", " ")}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <span>{opportunity.budgetBand}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <span>{opportunity.themeTag}</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Expected Return</p>
                      <p className="mt-1 font-semibold text-emerald-600">+{opportunity.expectedReturn.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Min. Entry</p>
                      <p className="mt-1 font-semibold text-foreground">{formatAmount(opportunity.minAmount, opportunity.currency)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Live Move</p>
                      <p className="mt-1 font-semibold text-foreground">{opportunity.marketMove >= 0 ? "+" : ""}{opportunity.marketMove.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Symbol</p>
                      <p className="mt-1 font-semibold text-foreground">{opportunity.symbol}</p>
                    </div>
                  </div>

                  <Link href={isLoggedIn ? "/market" : "/auth/sign-up"} className="mt-6">
                    <Button className="w-full rounded-full">{isLoggedIn ? "Open Market View" : "Sign Up to Invest"}</Button>
                  </Link>
                </article>
              )
            })}

            <article className="flex h-full flex-col justify-between rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_18px_40px_-20px_hsl(var(--primary)/0.85)]">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">Need a custom strategy?</h3>
                  <p className="text-sm text-primary-foreground/80">
                    We can generate a profile-aware custom portfolio aligned with your salary band and risk profile.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="mt-8 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Request Custom Deal
              </Button>
            </article>
          </div>
        )}
      </section>

      <footer className="grid gap-6 rounded-2xl border border-border/60 bg-card p-5 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Market Index</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{marketSnapshot.marketIndexLabel}</p>
          <p className="text-sm font-semibold text-emerald-600">+{marketSnapshot.marketIndexDelta.toFixed(2)}%</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Total Liquidity</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{formatCompact(marketSnapshot.totalLiquidity)}</p>
          <p className="text-sm text-muted-foreground">Combined market activity</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Active Projects</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{marketSnapshot.activeProjects.toLocaleString()}</p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Target Progress</p>
            <p className="text-sm font-semibold text-foreground">{marketSnapshot.targetFillPercent}%</p>
          </div>
          <div className="mt-4 h-2.5 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${marketSnapshot.targetFillPercent}%` }} />
          </div>
        </div>
      </footer>
    </div>
  )
}