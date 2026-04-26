"use client"

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
  symbol?: string
  source?: "bvmt" | "crypto" | "global"
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

function normalizeFilterLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function getSourceFilterLabel(opportunity: InvestmentOpportunity) {
  if (opportunity.source === "bvmt") return "BVMT"
  if (opportunity.source === "crypto") return "Crypto"
  if (opportunity.source === "global") return "Global Market"
  return opportunity.sector
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getBvmtInvestingEquityPath(name: string) {
  const normalizedName = normalizeCompanyName(name)

  const byName: Record<string, string> = {
    "automobile reseau tunisien et service": "automobile-reseau-tunisien-et-service",
    "astree sa": "astree-sa",
    atb: "atb",
    atl: "atl",
    "bh bank": "bh-bank",
    biat: "biat",
    bna: "bna",
    "attijari bank": "attijari-bank",
    bt: "bt",
    btei: "btei",
    "carthage cement": "carthage-cement",
    cil: "cil",
    icf: "icf",
    "societe tunisienne des marches de gros": "societe-tunisienne-des-marches-de-gros",
    "bh leasing": "bh-leasing",
    "societe nouvelle maison de la ville de tunis": "societe-nouvelle-maison-de-la-ville-de-tunis",
    "ennakl automobiles": "ennakl-automobiles",
    "placement de tunisie": "placement-de-tunisie",
    "poulina group holding": "poulina-group-holding",
    "les ciments de bizerte": "les-ciments-de-bizerte",
    sfbt: "sfbt",
    siam: "siam",
    simpar: "simpar",
    sits: "sits",
    "magasin general": "magazin-gneral",
    essoukna: "essoukna",
    somocer: "somocer",
    "societe tunisienne d entreprises de telecommunications": "societe-tunisienne-d-entreprises-de-telecommunications",
    "spdit-sicaf": "spdit-sicaf",
    star: "star",
    stb: "stb",
    stip: "stip",
    sotrapil: "sotrapil",
    "tun invest sicar": "tun-invest-sicar",
    "attijari leasing": "attijari-leasing",
    telnet: "telnet",
    "tunisie leasing": "tunisie-leasing",
    tpr: "tpr",
    "tunis re": "tunis-re",
    ubci: "ubci",
    uib: "uib",
    "el wifack leasing": "el-wifack-leasing",
    "societe tunisienne de verreries": "societe-tunisienne-de-verreries",
    "bh assurance": "bh-assurance",
    landor: "landor",
    "new body line": "new-body-line",
    "one tech holding": "one-tech-holding",
    "societe tunisienne industrielle du papier et du carton": "societe-tunisienne-industrielle-du-papier-et-du-carton",
    sotemail: "sotemail",
    sah: "sah",
    "hannibal lease": "hannibal-lease",
    "city cars": "city-cars",
    "euro-cycles": "euro-cycles",
    "manufacture de panneaux bois du sud": "manufacture-de-panneaux-bois-du-sud",
    "best lease": "best-lease",
    "delice holding": "delice-holding",
    "amen bank": "amen-bank",
  }

  if (byName[normalizedName]) {
    return byName[normalizedName]
  }

  return slugify(name)
}

function getBvmtCustomUrl(opportunity: InvestmentOpportunity) {
  const normalizedSymbol = normalizeTickerSymbol(opportunity.symbol || "")
  const normalizedName = normalizeCompanyName(opportunity.name)
  const normalizedId = opportunity.id.toLowerCase()

  // Force Monoprix to ilboursa even if feed formatting changes.
  if (
    normalizedSymbol === "MNP" ||
    normalizedName === "monoprix" ||
    normalizedName.includes("monoprix") ||
    normalizedName.includes("maison de la ville de tunis") ||
    normalizedId.includes("mnp") ||
    normalizedId.includes("monoprix")
  ) {
    return "https://www.ilboursa.com/marches/cotation_MNP"
  }

  const bySymbol: Record<string, string> = {
    MNP: "https://www.ilboursa.com/marches/cotation_MNP",
    DH: "https://www.ilboursa.com/marches/cotation_DH",
    TPR: "https://www.investing.com/equities/soc.-tun.-profiles-aluminium",
    SFBT: "https://www.ilboursa.com/marches/cotation_SFBT",
    BIAT: "https://www.investing.com/equities/banque-inter.-arabe-de-tunisie",
    CIL: "https://www.investing.com/equities/compagnie-int.-de-leasing",
    UIB: "https://www.investing.com/equities/union-internationale-de-banque",
  }

  if (normalizedSymbol && bySymbol[normalizedSymbol]) {
    return bySymbol[normalizedSymbol]
  }

  const byName: Record<string, string> = {
    monoprix: "https://www.ilboursa.com/marches/cotation_MNP",
    mnp: "https://www.ilboursa.com/marches/cotation_MNP",
    "societe nouvelle maison de la ville de tunis": "https://www.ilboursa.com/marches/cotation_MNP",
    "societe nouvelle maison de la ville de tunis sa": "https://www.ilboursa.com/marches/cotation_MNP",
    "delice holding": "https://www.ilboursa.com/marches/cotation_DH",
    tpr: "https://www.investing.com/equities/soc.-tun.-profiles-aluminium",
    "tpr tunisie profiles reunis": "https://www.investing.com/equities/soc.-tun.-profiles-aluminium",
    "tunisie profiles reunis": "https://www.investing.com/equities/soc.-tun.-profiles-aluminium",
    "tunisie profiles reunis sa": "https://www.investing.com/equities/soc.-tun.-profiles-aluminium",
    sfbt: "https://www.ilboursa.com/marches/cotation_SFBT",
    biat: "https://www.investing.com/equities/banque-inter.-arabe-de-tunisie",
    cil: "https://www.investing.com/equities/compagnie-int.-de-leasing",
    uib: "https://www.investing.com/equities/union-internationale-de-banque",
  }

  if (byName[normalizedName]) {
    return byName[normalizedName]
  }

  if (normalizedName.includes("tpr") && normalizedName.includes("tunisie") && normalizedName.includes("reunis")) {
    return "https://www.investing.com/equities/soc.-tun.-profiles-aluminium"
  }

  return null
}

function shouldHideOpportunity(opportunity: InvestmentOpportunity) {
  return normalizeCompanyName(opportunity.name) === "assurances maghrebia"
}

function normalizeTickerSymbol(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9.]/g, "")
}

function normalizeCompanyName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function toTradingViewSymbolPage(exchange: string, symbol: string) {
  return `https://www.tradingview.com/symbols/${encodeURIComponent(`${exchange}-${symbol}`)}/`
}

function getGlobalTradingViewTarget(opportunity: InvestmentOpportunity): { exchange: string; symbol: string } | null {
  const symbol = normalizeTickerSymbol(opportunity.symbol || "")
  const companyName = normalizeCompanyName(opportunity.name)

  const byName: Record<string, { exchange: string; symbol: string }> = {
    visa: { exchange: "TSX", symbol: "VISA" },
    "jpmorgan": { exchange: "NYSE", symbol: "JPM" },
    "jpmorgan chase": { exchange: "NYSE", symbol: "JPM" },
    toyota: { exchange: "NYSE", symbol: "TM" },
    "toyota motor": { exchange: "NYSE", symbol: "TM" },
    "sap se": { exchange: "XETR", symbol: "SAP" },
    sap: { exchange: "XETR", symbol: "SAP" },
    "alibaba": { exchange: "NYSE", symbol: "BABA" },
    "ali baba": { exchange: "NYSE", symbol: "BABA" },
    "asml holding": { exchange: "NASDAQ", symbol: "ASML" },
    asml: { exchange: "NASDAQ", symbol: "ASML" },
  }

  if (byName[companyName]) {
    return byName[companyName]
  }

  const byTicker: Record<string, string> = {
    VISA: "TSX",
    V: "TSX",
    JPM: "NYSE",
    TM: "NYSE",
    SAP: "XETR",
    BABA: "NYSE",
    ASML: "NASDAQ",
  }

  if (symbol) {
    return {
      exchange: byTicker[symbol] || "NASDAQ",
      symbol,
    }
  }

  return null
}

function getExploreDealHref(opportunity: InvestmentOpportunity) {
  if (opportunity.source === "crypto" || opportunity.id.startsWith("live:crypto")) {
    return `https://coinmarketcap.com/currencies/${slugify(opportunity.name)}/`
  }

  if (opportunity.source === "bvmt" || opportunity.id.startsWith("live:bvmt")) {
    const customUrl = getBvmtCustomUrl(opportunity)

    if (customUrl) {
      return customUrl
    }

    const equityPath = getBvmtInvestingEquityPath(opportunity.name)

    if (equityPath) {
      return `https://www.investing.com/equities/${equityPath}`
    }

    return `https://www.investing.com/search/?q=${encodeURIComponent(opportunity.name)}`
  }

  if (opportunity.source === "global" || opportunity.id.startsWith("live:global")) {
    const target = getGlobalTradingViewTarget(opportunity)

    if (target) {
      return toTradingViewSymbolPage(target.exchange, target.symbol)
    }

    return `https://www.tradingview.com/search/?query=${encodeURIComponent(opportunity.name)}`
  }

  return `/investment/${opportunity.id}`
}

function isExternalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://")
}

export function InvestmentOpportunitiesTab({
  opportunities,
  aiRecommendation,
  marketSnapshot,
}: InvestmentOpportunitiesTabProps) {
  const visibleOpportunities = useMemo(
    () => opportunities.filter((item) => !shouldHideOpportunity(item)),
    [opportunities],
  )

  const budgetFilters = useMemo(
    () => ["All Opportunities", ...Array.from(new Set(visibleOpportunities.map((item) => item.budgetBand)))],
    [visibleOpportunities],
  )

  const sectorFilters = useMemo(
    () => ["All", ...Array.from(new Set(visibleOpportunities.map((item) => getSourceFilterLabel(item))))],
    [visibleOpportunities],
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
    return visibleOpportunities.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description.toLowerCase().includes(searchValue.toLowerCase())

      const matchesBudget = activeBudget === "All Opportunities" || item.budgetBand === activeBudget
      const matchesSector =
        activeSector === "All" || normalizeFilterLabel(getSourceFilterLabel(item)) === normalizeFilterLabel(activeSector)

      return matchesSearch && matchesBudget && matchesSector
    })
  }, [activeBudget, activeSector, searchValue, visibleOpportunities])

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
              const exploreHref = getExploreDealHref(opportunity)
              const openInNewTab = isExternalUrl(exploreHref)

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

                  <a
                    href={exploreHref}
                    className="mt-6 block"
                    target={openInNewTab ? "_blank" : undefined}
                    rel={openInNewTab ? "noopener noreferrer" : undefined}
                  >
                    <Button className="w-full rounded-full">Explore Deal</Button>
                  </a>
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
