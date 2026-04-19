import type { RiskProfile } from "@/lib/types"

export type InvestmentSource = "bvmt" | "crypto" | "global"
export type OpportunityCurrency = "TND" | "USD"
export type InvestmentRiskBand = "LOW" | "MEDIUM" | "HIGH"

export interface BvmtStockFeedItem {
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  change_percent: number
  volume: number
  last_updated: string
}

export interface CryptoFeedItem {
  id: number
  name: string
  symbol: string
  price: number
  change_1h: number
  change_24h: number
  change_7d: number
  market_cap: number
  volume_24h: number
  last_updated: string
}

export interface GlobalStockFeedItem {
  symbol: string
  name: string
  sector: string
  country: string
  price: number
  change_percent: number
  volume: number
  market_cap: number
  last_updated: string
}

export interface InvestmentOpportunity {
  id: string
  name: string
  symbol: string
  description: string
  source: InvestmentSource
  sourceLabel: string
  segmentLabel: string
  budgetBand: string
  currency: OpportunityCurrency
  expectedReturn: number
  minAmount: number
  riskLevel: number
  riskBand: InvestmentRiskBand
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

export function buildInvestmentCatalog(options: {
  bvmtStocks: BvmtStockFeedItem[]
  cryptoAssets: CryptoFeedItem[]
  globalStocks: GlobalStockFeedItem[]
}) {
  const bvmtOpportunities = options.bvmtStocks.map(buildBvmtOpportunity)
  const cryptoOpportunities = options.cryptoAssets.map(buildCryptoOpportunity)
  const globalOpportunities = options.globalStocks.map(buildGlobalOpportunity)

  return [...bvmtOpportunities, ...cryptoOpportunities, ...globalOpportunities].sort((left, right) => {
    if (right.expectedReturn !== left.expectedReturn) {
      return right.expectedReturn - left.expectedReturn
    }

    return right.riskLevel - left.riskLevel
  })
}

export function buildPublicMarketSnapshot(opportunities: InvestmentOpportunity[]): PublicMarketSnapshot {
  const bvmtAverage = average(opportunities.filter((item) => item.source === "bvmt").map((item) => item.marketMove))
  const cryptoAverage = average(opportunities.filter((item) => item.source === "crypto").map((item) => item.marketMove))
  const globalAverage = average(opportunities.filter((item) => item.source === "global").map((item) => item.marketMove))
  const marketIndexDelta = Number((((bvmtAverage + cryptoAverage + globalAverage) / 3) || 0).toFixed(2))

  const totalLiquidity = opportunities.reduce((sum, item) => sum + item.activityValue, 0)
  const activeProjects = opportunities.length
  const positiveMomentum = opportunities.filter((item) => item.expectedReturn >= 6).length
  const targetFillPercent = activeProjects === 0 ? 0 : Math.round((positiveMomentum / activeProjects) * 100)

  return {
    marketIndexLabel: "BVMT + Crypto + Global",
    marketIndexDelta,
    totalLiquidity,
    activeProjects,
    targetFillPercent,
  }
}

export function buildPublicAIRecommendation(
  opportunities: InvestmentOpportunity[],
  profile: RiskProfile
): PublicAIRecommendation {
  if (opportunities.length === 0) {
    return {
      score: 0,
      title: "AI Recommendation for Your Profile",
      message: "No market opportunities are available yet. Refresh the BVMT and crypto feeds to generate a match.",
    }
  }

  const ranked = opportunities
    .map((opportunity) => ({
      ...opportunity,
      score: oracleStyleRecommendationScore(opportunity.expectedReturn, opportunity.riskLevel, profile),
    }))
    .sort((left, right) => right.score - left.score)

  const bestMatch = ranked[0]

  return {
    score: Number(bestMatch.score.toFixed(0)),
    title: "AI Recommendation for Your Profile",
    message: `Using Oracle-style score logic for ${profile} investors, the strongest current match is`,
    highlightedName: bestMatch.name,
  }
}

export function oracleStyleRecommendationScore(
  expectedReturn: number,
  riskLevel: number,
  profile: RiskProfile
) {
  let score = expectedReturn * 4

  if (profile === "conservative") {
    score -= riskLevel * 5
  } else if (profile === "moderate") {
    score -= Math.abs(riskLevel - 5) * 3
  } else {
    score += riskLevel * 2
  }

  return Math.max(0, Math.min(100, score))
}

function buildBvmtOpportunity(stock: BvmtStockFeedItem): InvestmentOpportunity {
  const marketMove = Number(stock.change_percent || 0)
  const minAmount = Math.max(100, stock.price * 10)
  const riskValue = 4 + Math.abs(marketMove) * 1.6 + riskFromVolume(stock.volume)

  return {
    id: `bvmt-${stock.symbol}`,
    name: stock.name,
    symbol: stock.symbol,
    description: `${stock.sector} equity tracked from the BVMT scraper with live pricing and daily momentum.`,
    source: "bvmt",
    sourceLabel: "BVMT",
    segmentLabel: stock.sector || "Unknown Sector",
    budgetBand: toTndBudgetBand(minAmount),
    currency: "TND",
    expectedReturn: clamp(Number((6 + Math.max(marketMove, 0) * 1.4).toFixed(1)), 1, 24),
    minAmount,
    riskLevel: toRiskLevel(riskValue),
    riskBand: toRiskBand(riskValue),
    marketMove,
    activityValue: stock.volume,
    themeTag: sectorThemeTag(stock.sector),
  }
}

function buildCryptoOpportunity(asset: CryptoFeedItem): InvestmentOpportunity {
  const marketMove = Number(asset.change_24h || 0)
  const volatility = Math.abs(Number(asset.change_1h || 0)) * 6 + Math.abs(Number(asset.change_7d || 0)) * 0.2
  const marketCapTier = cryptoTier(asset.market_cap, asset.symbol)
  const minAmount = recommendedCryptoEntry(asset.market_cap, asset.price)
  const riskValue = 6 + volatility + marketCapRisk(asset.market_cap)

  return {
    id: `crypto-${asset.id}`,
    name: asset.name,
    symbol: asset.symbol,
    description: `${marketCapTier} crypto asset sourced from CoinMarketCap with live momentum and market-cap tracking.`,
    source: "crypto",
    sourceLabel: "Crypto",
    segmentLabel: marketCapTier,
    budgetBand: toUsdBudgetBand(minAmount),
    currency: "USD",
    expectedReturn: clamp(Number((6 + Math.max(marketMove, 0) * 0.55 + Math.max(asset.change_7d, 0) * 0.18).toFixed(1)), 1, 40),
    minAmount,
    riskLevel: toRiskLevel(riskValue),
    riskBand: toRiskBand(riskValue),
    marketMove,
    activityValue: asset.volume_24h,
    themeTag: cryptoThemeTag(asset.symbol, marketCapTier),
  }
}

function buildGlobalOpportunity(stock: GlobalStockFeedItem): InvestmentOpportunity {
  const marketMove = Number(stock.change_percent || 0)
  const volumeRiskBoost = stock.volume >= 1_000_000 ? -0.6 : stock.volume >= 250_000 ? 0 : 0.7
  const marketCapRiskBoost = stock.market_cap >= 100_000_000_000 ? -0.6 : stock.market_cap >= 10_000_000_000 ? 0 : 0.6
  const riskValue = 5 + Math.abs(marketMove) * 0.9 + volumeRiskBoost + marketCapRiskBoost
  const minAmount = Math.max(120, Math.round(stock.price * 3))

  return {
    id: `global-${stock.symbol}`,
    name: stock.name,
    symbol: stock.symbol,
    description: `${stock.sector || "Global Equity"} listed in ${stock.country || "global markets"}, sourced from Investing.com stock screener via scrape.do.`,
    source: "global",
    sourceLabel: "Global Market",
    segmentLabel: stock.sector || "Global Equity",
    budgetBand: toUsdBudgetBand(minAmount),
    currency: "USD",
    expectedReturn: clamp(Number((5 + Math.max(marketMove, 0) * 0.85).toFixed(1)), 1, 28),
    minAmount,
    riskLevel: toRiskLevel(riskValue),
    riskBand: toRiskBand(riskValue),
    marketMove,
    activityValue: stock.volume,
    themeTag: globalThemeTag(stock.sector),
  }
}

function recommendedCryptoEntry(marketCap: number, price: number) {
  if (isStablecoin(price, marketCap)) return 100
  if (marketCap >= 100_000_000_000) return 250
  if (marketCap >= 10_000_000_000) return 150
  if (marketCap >= 1_000_000_000) return 75
  return 40
}

function cryptoTier(marketCap: number, symbol: string) {
  if (isStablecoin(1, marketCap, symbol)) return "Stablecoin"
  if (marketCap >= 100_000_000_000) return "Large Cap"
  if (marketCap >= 10_000_000_000) return "Mid Cap"
  if (marketCap >= 1_000_000_000) return "Emerging Cap"
  return "Small Cap"
}

function cryptoThemeTag(symbol: string, tier: string) {
  if (["BTC", "ETH"].includes(symbol)) return "Blue Chip"
  if (tier === "Stablecoin") return "Defensive"
  if (tier === "Large Cap") return "Store of Value"
  return "High Momentum"
}

function sectorThemeTag(sector: string) {
  const normalized = sector.toLowerCase()

  if (normalized.includes("bank")) return "Income Security"
  if (normalized.includes("insurance")) return "Capital Protection"
  if (normalized.includes("technology")) return "Growth Potential"
  if (normalized.includes("leasing")) return "Yield Play"
  if (normalized.includes("distribution")) return "Consumer Exposure"
  return "Balanced Growth"
}

function globalThemeTag(sector: string) {
  const normalized = (sector || "").toLowerCase()

  if (normalized.includes("technology")) return "Global Growth"
  if (normalized.includes("financial")) return "Macro Sensitive"
  if (normalized.includes("health")) return "Defensive Growth"
  if (normalized.includes("energy")) return "Commodity Cycle"
  return "International Diversifier"
}

function riskFromVolume(volume: number) {
  if (volume >= 75_000) return -0.5
  if (volume >= 25_000) return 0
  return 0.8
}

function marketCapRisk(marketCap: number) {
  if (marketCap >= 100_000_000_000) return -0.8
  if (marketCap >= 10_000_000_000) return 0
  if (marketCap >= 1_000_000_000) return 0.7
  return 1.2
}

function isStablecoin(price: number, marketCap: number, symbol?: string) {
  const normalizedSymbol = (symbol || "").toUpperCase()
  return (
    normalizedSymbol.includes("USD") ||
    normalizedSymbol.includes("USDT") ||
    normalizedSymbol.includes("USDC") ||
    (price >= 0.95 && price <= 1.05 && marketCap >= 1_000_000_000)
  )
}

function toTndBudgetBand(minAmount: number) {
  if (minAmount < 1000) return "< 1,000 TND"
  if (minAmount <= 10_000) return "1,000 - 10,000 TND"
  return "> 10,000 TND"
}

function toUsdBudgetBand(minAmount: number) {
  if (minAmount < 100) return "< $100"
  if (minAmount <= 1000) return "$100 - $1,000"
  return "> $1,000"
}

function toRiskBand(value: number): InvestmentRiskBand {
  if (value <= 3) return "LOW"
  if (value <= 6) return "MEDIUM"
  return "HIGH"
}

function toRiskLevel(value: number) {
  return Math.max(1, Math.min(10, Math.round(value)))
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
