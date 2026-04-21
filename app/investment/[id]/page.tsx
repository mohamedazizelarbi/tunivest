import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InvestmentSimulationForm, type InvestmentDealPayload } from "@/components/investment/investment-simulation-form"
import { buildInvestmentCatalog, type BvmtStockFeedItem, type CryptoFeedItem, type GlobalStockFeedItem } from "@/lib/investments/catalog"
import type { Investment } from "@/lib/types"

interface InvestmentDetailPageProps {
  params: Promise<{ id: string }>
}

type BvmtFeedResponse = {
  success: boolean
  source: string
  market_status: string
  trading_hours: string
  data: {
    stocks: BvmtStockFeedItem[]
  }
  last_updated: string
}

type CryptoFeedResponse = {
  success: boolean
  source: string
  data: CryptoFeedItem[]
}

type GlobalFeedResponse = {
  success: boolean
  source: string
  data: {
    stocks: GlobalStockFeedItem[]
  }
  last_updated: string
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 60 } })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

function categoryLabel(category: Investment["category"] | string) {
  const labels: Record<string, string> = {
    bonds: "Bonds",
    stocks: "Stocks",
    funds: "Funds",
    real_estate: "Real Estate",
    crypto: "Crypto",
  }

  return labels[category] || category
}

function getChartSymbol(source: string, symbol: string | null, category: string) {
  if (source === "crypto") {
    const normalized = (symbol || "BTC").toUpperCase().replace(/[^A-Z0-9]/g, "")
    return `BINANCE:${normalized}USDT`
  }

  if (source === "bvmt") {
    return "TVC:TUNINDEX"
  }

  if (source === "global") {
    return symbol && /^[A-Z]{1,5}$/.test(symbol) ? `NASDAQ:${symbol}` : "NASDAQ:AAPL"
  }

  if (category === "crypto") return "BINANCE:BTCUSDT"
  if (category === "stocks") return "NASDAQ:AAPL"
  return "TVC:TUNINDEX"
}

function getLiveTypeLabel(source: string) {
  if (source === "crypto") return "Crypto"
  if (source === "bvmt") return "Tunisian Equity"
  if (source === "global") return "Global Equity"
  return "Live Market"
}

function choosePortfolioInvestmentId(investments: Pick<Investment, "id" | "category" | "name" | "expected_return">[]) {
  const stockMatch = investments.find((item) => item.category === "stocks")
  return stockMatch || investments[0] || null
}

function getEmbedUrl(symbol: string) {
  return `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=1&theme=dark&style=1&timezone=Africa/Tunis&withdateranges=1&hideideas=1&locale=en`
}

export default async function InvestmentDetailPage({ params }: InvestmentDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: dbInvestment }, { data: latestMarketData }, { data: activeInvestments }] = await Promise.all([
    supabase.from("investments").select("*").eq("id", id).eq("is_active", true).maybeSingle(),
    supabase
      .from("market_data")
      .select("price, change_percent, recorded_at")
      .eq("investment_id", id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("investments")
      .select("id, category, name, expected_return")
      .eq("is_active", true)
      .order("expected_return", { ascending: false }),
  ])

  const baseUrl = getBaseUrl()
  const [bvmtFeed, cryptoFeed, globalFeed] =
    dbInvestment
      ? [null, null, null]
      : await Promise.all([
          fetchJson<BvmtFeedResponse>(`${baseUrl}/api/market/bvmt`),
          fetchJson<CryptoFeedResponse>(`${baseUrl}/api/market/crypto`),
          fetchJson<GlobalFeedResponse>(`${baseUrl}/api/market/global`),
        ])

  const liveCatalog = dbInvestment
    ? []
    : buildInvestmentCatalog({
        bvmtStocks: bvmtFeed?.data.stocks || [],
        cryptoAssets: cryptoFeed?.data || [],
        globalStocks: globalFeed?.data.stocks || [],
      })

  const liveDeal = liveCatalog.find((item) => item.id === id) || null
  const portfolioInvestment = choosePortfolioInvestmentId(activeInvestments || [])

  if (!dbInvestment && !liveDeal) {
    notFound()
  }

  const isLiveMarket = Boolean(liveDeal)

  const deal: InvestmentDealPayload = dbInvestment
    ? {
        id: dbInvestment.id,
        name: dbInvestment.name,
        description: dbInvestment.description || "Simulate this investment before adding it to your portfolio.",
        typeLabel: categoryLabel(dbInvestment.category),
        currentPrice: latestMarketData?.price || dbInvestment.min_amount,
        expectedReturn: dbInvestment.expected_return,
        riskLevel: dbInvestment.risk_level,
        chartSymbol: getChartSymbol("database", null, dbInvestment.category),
        portfolioInvestmentId: dbInvestment.id,
        portfolioInvestmentName: dbInvestment.name,
        portfolioDealKey: dbInvestment.id,
        portfolioDisplayName: dbInvestment.name,
        portfolioDealType: categoryLabel(dbInvestment.category),
        isLiveMarket: false,
      }
    : {
        id: liveDeal.id,
        name: liveDeal.name,
        description: liveDeal.description,
      typeLabel: getLiveTypeLabel(liveDeal.source),
        currentPrice: liveDeal.minAmount,
        expectedReturn: liveDeal.expectedReturn,
        riskLevel: liveDeal.riskLevel,
        chartSymbol: getChartSymbol(liveDeal.source, liveDeal.symbol, liveDeal.segmentLabel),
        portfolioInvestmentId: portfolioInvestment?.id || liveDeal.id,
        portfolioInvestmentName: liveDeal.name,
        portfolioDealKey: liveDeal.id,
        portfolioDisplayName: liveDeal.name,
        portfolioDealType: getLiveTypeLabel(liveDeal.source),
        isLiveMarket: true,
      }

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
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Market Chart</CardTitle>
            <CardDescription>
              Live widget for the selected opportunity. This is informational only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <iframe
                title={`${deal.name} market chart`}
                src={getEmbedUrl(deal.chartSymbol)}
                className="h-[420px] w-full"
                loading="lazy"
                allow="fullscreen"
              />
            </div>
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
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="text-lg font-semibold text-foreground">{deal.currentPrice.toLocaleString()} TND</p>
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
                <p className="text-xs text-muted-foreground">Saved To</p>
                <p className="text-lg font-semibold text-foreground">{deal.portfolioInvestmentName}</p>
              </div>
            </div>
            {deal.isLiveMarket ? (
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                Live-feed opportunities are simulated against a representative portfolio asset so they can be stored in your portfolio safely.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <InvestmentSimulationForm userId={user.id} deal={deal} />
    </div>
  )
}
