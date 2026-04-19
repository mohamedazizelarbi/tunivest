import { createClient } from "@/lib/supabase/server"
import { InvestmentOpportunitiesTab, type InvestmentOpportunity, type MarketSnapshot } from "@/components/dashboard/investment-opportunities-tab"

const categoryLabels: Record<string, string> = {
  bonds: "Bonds",
  stocks: "Stocks",
  funds: "Funds",
  real_estate: "Real Estate",
  crypto: "Crypto",
}

function toBudgetBand(minAmount: number) {
  if (minAmount < 1000) return "< 1,000 TND"
  if (minAmount <= 10000) return "1,000 - 10,000 TND"
  return "> 10,000 TND"
}

function toThemeTag(category: string, riskLevel: number) {
  if (riskLevel <= 3) return "Stable Asset"
  if (riskLevel >= 8) return "Venture Risk"

  const byCategory: Record<string, string> = {
    bonds: "Income Security",
    funds: "Diversified Fund",
    real_estate: "Tangible Asset",
    stocks: "Growth Potential",
    crypto: "High Momentum",
  }

  return byCategory[category] || "Balanced Growth"
}

export default async function InvestOpportunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [{ data: investments }, { data: recommendation }, { data: liquidityRows }] = await Promise.all([
    supabase
      .from("investments")
      .select("id, name, description, min_amount, expected_return, category, risk_level")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("recommendations")
      .select("score, reason, investment:investments(id, name)")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("transactions")
      .select("total_value")
      .order("created_at", { ascending: false })
      .limit(120),
  ])

  const opportunities: InvestmentOpportunity[] =
    investments?.map((investment) => ({
      id: investment.id,
      name: investment.name,
      description: investment.description || "Curated investment thesis aligned with Tunisia-focused growth.",
      expectedReturn: investment.expected_return,
      minEntry: investment.min_amount,
      sector: categoryLabels[investment.category] || investment.category,
      budgetBand: toBudgetBand(investment.min_amount),
      themeTag: toThemeTag(investment.category, investment.risk_level),
      riskLevel: investment.risk_level,
    })) || []

  const totalLiquidity =
    liquidityRows?.reduce((sum, row) => sum + (row.total_value || 0), 0) || 0

  const marketSnapshot: MarketSnapshot = {
    marketIndexLabel: "TUNINDEX",
    marketIndexDelta: 0.42,
    totalLiquidity,
    activeProjects: opportunities.length,
    targetFillPercent: 75,
  }

  const aiRecommendation = recommendation
    ? {
        score: recommendation.score,
        title: `AI Recommendation for Your Budget`,
        message:
          recommendation.reason ||
          "Based on your profile, this opportunity is currently one of the strongest matches.",
        highlightedName: recommendation.investment?.name || undefined,
      }
    : {
        score: 84,
        title: "AI Recommendation for Your Budget",
        message:
          "Based on your recent behavior, we suggest exploring diversified opportunities with moderate risk and stable annual yield.",
      }

  return (
    <InvestmentOpportunitiesTab
      opportunities={opportunities}
      aiRecommendation={aiRecommendation}
      marketSnapshot={marketSnapshot}
    />
  )
}
