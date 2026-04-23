import { createClient } from "@/lib/supabase/server"
import { InvestmentOpportunitiesTab, type InvestmentOpportunity, type MarketSnapshot } from "@/components/dashboard/investment-opportunities-tab"
import type { RiskProfile } from "@/lib/types"
import {
  buildInvestmentCatalog,
  buildPublicAIRecommendation,
  buildPublicMarketSnapshot,
  type BvmtStockFeedItem,
  type CryptoFeedItem,
  type GlobalStockFeedItem,
} from "@/lib/investments/catalog"

type BvmtFeedResponse = {
  success: boolean
  source: string
  market_status: string
  trading_hours: string
  data: {
    stocks: BvmtStockFeedItem[]
  }
  last_updated: string
  note?: string
}

type CryptoFeedResponse = {
  success: boolean
  source: string
  data: CryptoFeedItem[]
  message?: string
}

type GlobalFeedResponse = {
  success: boolean
  source: string
  data: {
    stocks: GlobalStockFeedItem[]
  }
  last_updated: string
  note?: string
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 60 },
    })

    if (!response.ok) return null

    return (await response.json()) as T
  } catch {
    return null
  }
}

function categoryLabelToSector(sourceLabel: string) {
  return sourceLabel
}

function toDashboardOpportunity(
  item: ReturnType<typeof buildInvestmentCatalog>[number],
): InvestmentOpportunity {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    expectedReturn: item.expectedReturn,
    minEntry: item.minAmount,
    sector: categoryLabelToSector(item.sourceLabel),
    budgetBand: item.budgetBand,
    themeTag: item.themeTag,
    riskLevel: item.riskLevel,
  }
}

export default async function InvestOpportunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("risk_profile")
    .eq("id", user.id)
    .single()

  const baseUrl = getBaseUrl()
  const [bvmtFeed, cryptoFeed, globalFeed] = await Promise.all([
    fetchJson<BvmtFeedResponse>(`${baseUrl}/api/market/bvmt`),
    fetchJson<CryptoFeedResponse>(`${baseUrl}/api/market/crypto`),
    fetchJson<GlobalFeedResponse>(`${baseUrl}/api/market/global`),
  ])

  const catalog = buildInvestmentCatalog({
    bvmtStocks: bvmtFeed?.data.stocks || [],
    cryptoAssets: cryptoFeed?.data || [],
    globalStocks: globalFeed?.data.stocks || [],
  })

  const opportunities = catalog.map(toDashboardOpportunity)

  const userRiskProfile: RiskProfile =
    profile?.risk_profile === "conservative" ||
    profile?.risk_profile === "moderate" ||
    profile?.risk_profile === "aggressive"
      ? profile.risk_profile
      : "moderate"

  const aiRecommendation = buildPublicAIRecommendation(
    catalog,
    userRiskProfile,
  )

  const marketSnapshot: MarketSnapshot = buildPublicMarketSnapshot(catalog)

  return (
    <InvestmentOpportunitiesTab
      opportunities={opportunities}
      aiRecommendation={aiRecommendation}
      marketSnapshot={marketSnapshot}
    />
  )
}
