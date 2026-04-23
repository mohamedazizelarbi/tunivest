"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  Building2,
  Factory,
  Landmark,
  Leaf,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface InvestmentOpportunity {
  id: string
  name: string
  description: string
  expectedReturn: number
  minEntry: number
  sector: string
  budgetBand: string
  themeTag: string
  riskLevel: number
}

interface AIRecommendation {
  score: number
  title: string
  message: string
  highlightedName?: string
}

export interface MarketSnapshot {
  marketIndexLabel: string
  marketIndexDelta: number
  totalLiquidity: number
  activeProjects: number
  targetFillPercent: number
}

interface InvestmentOpportunitiesTabProps {
  opportunities: InvestmentOpportunity[]
  aiRecommendation: AIRecommendation
  marketSnapshot: MarketSnapshot
}

const iconBySector: Record<string, LucideIcon> = {
  BVMT: Landmark,
  "Global Market": Building2,
  Bonds: Landmark,
  Funds: Factory,
  "Real Estate": Building2,
  Stocks: Rocket,
  Crypto: Sun,
}

function formatTnd(value: number) {
  return `${Math.round(value).toLocaleString()} TND`
}

function formatCompact(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }

  return value.toLocaleString()
}

function getTagTone(tag: string) {
  if (tag.includes("Stable") || tag.includes("Income")) {
    return "bg-indigo-100 text-indigo-700"
  }

  if (tag.includes("Venture") || tag.includes("Momentum")) {
    return "bg-rose-100 text-rose-700"
  }

  return "bg-emerald-100 text-emerald-700"
}

export function InvestmentOpportunitiesTab({
  opportunities,
  aiRecommendation,
  marketSnapshot,
}: InvestmentOpportunitiesTabProps) {
  const budgetFilters = useMemo(
    () => ["All Opportunities", ...Array.from(new Set(opportunities.map((item) => item.budgetBand)))],
    [opportunities],
  )

  const sectorFilters = useMemo(
    () => ["All", ...Array.from(new Set(opportunities.map((item) => item.sector)))],
    [opportunities],
  )

  const [searchValue, setSearchValue] = useState("")
  const [activeBudget, setActiveBudget] = useState("All Opportunities")
  const [activeSector, setActiveSector] = useState("All")

  useEffect(() => {
    if (!budgetFilters.includes(activeBudget)) {
      setActiveBudget("All Opportunities")
    }
  }, [activeBudget, budgetFilters])

  useEffect(() => {
    if (!sectorFilters.includes(activeSector)) {
      setActiveSector("All")
    }
  }, [activeSector, sectorFilters])

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description.toLowerCase().includes(searchValue.toLowerCase())

      const matchesBudget = activeBudget === "All Opportunities" || item.budgetBand === activeBudget
      const matchesSector = activeSector === "All" || item.sector === activeSector

      return matchesSearch && matchesBudget && matchesSector
    })
  }, [activeBudget, activeSector, opportunities, searchValue])

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search opportunities..."
            className="h-11 rounded-full border-border/70 bg-background pl-9"
          />
        </div>

        <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-border/70">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
      </header>

      <section className="space-y-5 rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 p-6 sm:p-8">
        <Badge className="w-fit rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          Tunisian Market
        </Badge>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Investment Opportunities
            </h1>
            <p className="max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
              Discover high-yield ventures curated for the North African economic landscape. Grow your TND assets with precision.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full border-border/70 px-5">
              Export Report
            </Button>
            <Button className="rounded-full px-5 shadow-lg shadow-primary/20">
              Market Insights
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
                {aiRecommendation.message}{" "}
                {aiRecommendation.highlightedName ? (
                  <span className="font-semibold text-primary">{aiRecommendation.highlightedName}</span>
                ) : null}
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
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {sectorFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveSector(filter)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                activeSector === filter
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
              const SectorIcon = iconBySector[opportunity.sector] || Leaf

              return (
                <article
                  key={opportunity.id}
                  className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-5 shadow-[0_14px_35px_-22px_hsl(var(--foreground)/0.25)] transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <SectorIcon className="h-5 w-5" />
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", getTagTone(opportunity.themeTag))}>
                      {opportunity.themeTag}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">{opportunity.name}</h3>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{opportunity.description}</p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Expected Return</p>
                      <p className="mt-1 font-semibold text-emerald-600">+{opportunity.expectedReturn.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Min. Entry</p>
                      <p className="mt-1 font-semibold text-foreground">{formatTnd(opportunity.minEntry)}</p>
                    </div>
                  </div>

                  <Link href={`/investment/${opportunity.id}`} className="mt-6">
                    <Button className="w-full rounded-full">Explore Deal</Button>
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
                  <h3 className="text-2xl font-semibold">Can&apos;t find a match?</h3>
                  <p className="text-sm text-primary-foreground/80">
                    Our advisors can source custom opportunities based on your target return and risk profile.
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
          <p className="text-sm text-muted-foreground">TND</p>
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
