import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  InvestmentOpportunitiesView,
  type PublicAIRecommendation,
  type PublicMarketSnapshot,
  type PublicOpportunity,
} from "@/components/investments/investment-opportunities-view"
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

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: { email: string; full_name: string | null; is_admin: boolean; risk_profile?: RiskProfile } | null = null

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("email, full_name, is_admin, risk_profile")
      .eq("id", user.id)
      .single()

    profile = data
  }

  const baseUrl = getBaseUrl()
  const [bvmtFeed, cryptoFeed, globalFeed] = await Promise.all([
    fetchJson<BvmtFeedResponse>(`${baseUrl}/api/market/bvmt`),
    fetchJson<CryptoFeedResponse>(`${baseUrl}/api/market/crypto`),
    fetchJson<GlobalFeedResponse>(`${baseUrl}/api/market/global`),
  ])

  const opportunities = buildInvestmentCatalog({
    bvmtStocks: bvmtFeed?.data.stocks || [],
    cryptoAssets: cryptoFeed?.data || [],
    globalStocks: globalFeed?.data.stocks || [],
  }) as PublicOpportunity[]

  const userRiskProfile: RiskProfile =
    profile?.risk_profile === "conservative" ||
    profile?.risk_profile === "moderate" ||
    profile?.risk_profile === "aggressive"
      ? profile.risk_profile
      : "moderate"

  const aiRecommendation: PublicAIRecommendation = buildPublicAIRecommendation(opportunities, userRiskProfile)
  const marketSnapshot: PublicMarketSnapshot = buildPublicMarketSnapshot(opportunities)

  const sourceNotes = [bvmtFeed?.note, cryptoFeed?.message, globalFeed?.note].filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1">
        <section className="py-10 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {sourceNotes.length > 0 ? (
              <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-foreground/80">{sourceNotes.join(" ")}</p>
              </div>
            ) : null}

            <InvestmentOpportunitiesView
              opportunities={opportunities}
              isLoggedIn={!!user}
              aiRecommendation={aiRecommendation}
              marketSnapshot={marketSnapshot}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
