import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { buildInvestmentCatalog, type BvmtStockFeedItem, type CryptoFeedItem, type GlobalStockFeedItem } from "@/lib/investments/catalog"
import type { Investment } from "@/lib/types"
import type { InvestmentDealPayload } from "@/components/investment/investment-simulation-form"
import InvestmentDetailClientPage from "./client-page"

type BvmtFeedResponse = {
  success: boolean
  data: BvmtStockFeedItem[]
}

type CryptoFeedResponse = {
  success: boolean
  data: CryptoFeedItem[]
}

type GlobalFeedResponse = {
  success: boolean
  data: GlobalStockFeedItem[]
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

function getChartSymbol(source: string, symbol: string | null, category: string) {
  if (source === "crypto") {
    const normalized = (symbol || "BTC").toUpperCase().replace(/[^A-Z0-9]/g, "")
    return `BINANCE:${normalized}USDT`
  }

  if (source === "bvmt") return "TVC:TUNINDEX"

  if (source === "global") {
    return symbol && /^[A-Z]{1,5}$/.test(symbol) ? `NASDAQ:${symbol}` : "NASDAQ:AAPL"
  }

  if (category === "crypto") return "BINANCE:BTCUSDT"
  if (category === "stocks") return "NASDAQ:AAPL"
  return "TVC:TUNINDEX"
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

async function getInvestmentDeal(id: string): Promise<{ deal: InvestmentDealPayload; currency: string } | null> {
  const decodedId = decodeURIComponent(id)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const isLiveDeal = decodedId.startsWith("live:")

  if (isLiveDeal) {
    const baseUrl = getBaseUrl()
    const [bvmtFeed, cryptoFeed, globalFeed] = await Promise.all([
      fetchJson<BvmtFeedResponse>(`${baseUrl}/api/market/bvmt`),
      fetchJson<CryptoFeedResponse>(`${baseUrl}/api/market/crypto`),
      fetchJson<GlobalFeedResponse>(`${baseUrl}/api/market/global`),
    ])

    const { data: activeInvestments } = await supabase
      .from("investments")
      .select("id, category, name, expected_return")
      .eq("is_active", true)
      .order("expected_return", { ascending: false })

    const catalog = buildInvestmentCatalog({
      bvmtStocks: bvmtFeed?.data || [],
      cryptoAssets: cryptoFeed?.data || [],
      globalStocks: globalFeed?.data || [],
    })

    const liveDeal = catalog.find((item) => item.id === decodedId)
    const portfolioInvestment = choosePortfolioInvestmentId(activeInvestments || [])

    if (!liveDeal) {
      return null
    }

    return {
      currency: liveDeal.currency,
      deal: {
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
      },
    }
  }

  const [{ data: dbInvestment }, { data: latestMarketData }] = await Promise.all([
    supabase.from("investments").select("*").eq("id", decodedId).eq("is_active", true).maybeSingle(),
    supabase
      .from("market_data")
      .select("price, change_percent, recorded_at")
      .eq("investment_id", decodedId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!dbInvestment) {
    return null
  }

  const investment = dbInvestment as Investment
  return {
    currency: "TND",
    deal: {
      id: investment.id,
      name: investment.name,
      description: investment.description || "Simulate this investment before adding it to your portfolio.",
      typeLabel: categoryLabel(investment.category),
      currentPrice: latestMarketData?.price || investment.min_amount,
      expectedReturn: investment.expected_return,
      riskLevel: investment.risk_level,
      chartSymbol: getChartSymbol("database", null, investment.category),
      portfolioInvestmentId: investment.id,
      portfolioInvestmentName: investment.name,
      portfolioDealKey: investment.id,
      portfolioDisplayName: investment.name,
      portfolioDealType: categoryLabel(investment.category),
      isLiveMarket: false,
    },
  }
}

export default async function InvestmentPage({ params }: { params: { id: string } }) {
  const dealState = await getInvestmentDeal(params.id)

  if (!dealState) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <InvestmentDetailClientPage userId={user.id} deal={dealState.deal} currency={dealState.currency} />
}
