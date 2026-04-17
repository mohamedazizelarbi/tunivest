import { NextResponse } from "next/server"

// CoinMarketCap API endpoint
const CMC_API_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"

export interface CryptoData {
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

export async function GET() {
  const apiKey = process.env.COINMARKETCAP_API_KEY

  if (!apiKey) {
    // Return mock data when API key is not configured
    return NextResponse.json({
      success: true,
      source: "mock",
      data: getMockCryptoData(),
      message: "Using mock data. Add COINMARKETCAP_API_KEY for real data.",
    })
  }

  try {
    const response = await fetch(CMC_API_URL + "?limit=20&convert=USD", {
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`)
    }

    const result = await response.json()

    const cryptoData: CryptoData[] = result.data.map((coin: {
      id: number
      name: string
      symbol: string
      quote: {
        USD: {
          price: number
          percent_change_1h: number
          percent_change_24h: number
          percent_change_7d: number
          market_cap: number
          volume_24h: number
        }
      }
      last_updated: string
    }) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      change_1h: coin.quote.USD.percent_change_1h,
      change_24h: coin.quote.USD.percent_change_24h,
      change_7d: coin.quote.USD.percent_change_7d,
      market_cap: coin.quote.USD.market_cap,
      volume_24h: coin.quote.USD.volume_24h,
      last_updated: coin.last_updated,
    }))

    return NextResponse.json({
      success: true,
      source: "coinmarketcap",
      data: cryptoData,
    })
  } catch (error) {
    console.error("CoinMarketCap API error:", error)
    return NextResponse.json({
      success: true,
      source: "mock",
      data: getMockCryptoData(),
      message: "API error. Using mock data.",
    })
  }
}

function getMockCryptoData(): CryptoData[] {
  const now = new Date().toISOString()
  return [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      price: 98542.32,
      change_1h: 0.15,
      change_24h: 2.34,
      change_7d: 5.67,
      market_cap: 1943000000000,
      volume_24h: 28500000000,
      last_updated: now,
    },
    {
      id: 1027,
      name: "Ethereum",
      symbol: "ETH",
      price: 3856.78,
      change_1h: -0.08,
      change_24h: 1.89,
      change_7d: 4.23,
      market_cap: 463000000000,
      volume_24h: 15200000000,
      last_updated: now,
    },
    {
      id: 1839,
      name: "BNB",
      symbol: "BNB",
      price: 612.45,
      change_1h: 0.32,
      change_24h: 0.78,
      change_7d: 2.15,
      market_cap: 91000000000,
      volume_24h: 1800000000,
      last_updated: now,
    },
    {
      id: 5426,
      name: "Solana",
      symbol: "SOL",
      price: 187.23,
      change_1h: 0.45,
      change_24h: 3.56,
      change_7d: 8.91,
      market_cap: 82000000000,
      volume_24h: 3200000000,
      last_updated: now,
    },
    {
      id: 52,
      name: "XRP",
      symbol: "XRP",
      price: 2.34,
      change_1h: -0.12,
      change_24h: 1.23,
      change_7d: 3.45,
      market_cap: 134000000000,
      volume_24h: 8700000000,
      last_updated: now,
    },
    {
      id: 2010,
      name: "Cardano",
      symbol: "ADA",
      price: 0.89,
      change_1h: 0.28,
      change_24h: 2.67,
      change_7d: 6.78,
      market_cap: 31000000000,
      volume_24h: 890000000,
      last_updated: now,
    },
    {
      id: 74,
      name: "Dogecoin",
      symbol: "DOGE",
      price: 0.178,
      change_1h: 0.56,
      change_24h: 4.12,
      change_7d: 12.34,
      market_cap: 26000000000,
      volume_24h: 2100000000,
      last_updated: now,
    },
    {
      id: 6636,
      name: "Polygon",
      symbol: "MATIC",
      price: 0.92,
      change_1h: 0.18,
      change_24h: 1.56,
      change_7d: 4.89,
      market_cap: 8500000000,
      volume_24h: 450000000,
      last_updated: now,
    },
    {
      id: 5994,
      name: "Shiba Inu",
      symbol: "SHIB",
      price: 0.0000234,
      change_1h: 0.89,
      change_24h: 5.67,
      change_7d: 15.23,
      market_cap: 13800000000,
      volume_24h: 780000000,
      last_updated: now,
    },
    {
      id: 3408,
      name: "USDC",
      symbol: "USDC",
      price: 1.0,
      change_1h: 0.0,
      change_24h: 0.01,
      change_7d: 0.0,
      market_cap: 42000000000,
      volume_24h: 7800000000,
      last_updated: now,
    },
  ]
}
