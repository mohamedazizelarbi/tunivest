import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

const SCRAPE_DO_API_URL = "https://api.scrape.do"
const INVESTING_GLOBAL_SCREENER_URL = "https://www.investing.com/stock-screener"

export interface GlobalStock {
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

const GLOBAL_FALLBACK_STOCKS: Array<
  Omit<GlobalStock, "price" | "change_percent" | "volume" | "market_cap" | "last_updated">
> = [
  { symbol: "AAPL", name: "Apple Inc", sector: "Technology", country: "United States" },
  { symbol: "MSFT", name: "Microsoft Corp", sector: "Technology", country: "United States" },
  { symbol: "AMZN", name: "Amazon.com Inc", sector: "Consumer Discretionary", country: "United States" },
  { symbol: "GOOGL", name: "Alphabet Inc", sector: "Communication Services", country: "United States" },
  { symbol: "NVDA", name: "NVIDIA Corp", sector: "Technology", country: "United States" },
  { symbol: "TSLA", name: "Tesla Inc", sector: "Consumer Discretionary", country: "United States" },
  { symbol: "JPM", name: "JPMorgan Chase & Co", sector: "Financials", country: "United States" },
  { symbol: "V", name: "Visa Inc", sector: "Financials", country: "United States" },
  { symbol: "ASML", name: "ASML Holding NV", sector: "Technology", country: "Netherlands" },
  { symbol: "SAP", name: "SAP SE", sector: "Technology", country: "Germany" },
  { symbol: "TM", name: "Toyota Motor Corp", sector: "Consumer Discretionary", country: "Japan" },
  { symbol: "BABA", name: "Alibaba Group Holding", sector: "Consumer Discretionary", country: "China" },
]

export async function GET() {
  const now = new Date()
  const token = process.env.SCRAPE_DO_TOKEN

  if (token) {
    try {
      const scrapeParams = new URLSearchParams({
        token,
        url: INVESTING_GLOBAL_SCREENER_URL,
        render: "true",
      })

      const response = await fetch(`${SCRAPE_DO_API_URL}/?${scrapeParams.toString()}`, {
        method: "GET",
        headers: {
          Accept: "text/html",
        },
        next: { revalidate: 60 },
      })

      if (response.ok) {
        const html = await response.text()
        const stocks = extractGlobalStocksFromHtml(html, now)

        if (stocks.length > 0) {
          return NextResponse.json({
            success: true,
            source: "investing-scrape-do",
            data: {
              stocks,
            },
            last_updated: now.toISOString(),
            note: "Live global equities data scraped from Investing.com stock screener via scrape.do.",
          })
        }
      }
    } catch (error) {
      console.error("Global market scrape failed, falling back to simulated data:", error)
    }
  }

  return NextResponse.json({
    success: true,
    source: "global-fallback",
    data: {
      stocks: generateFallbackGlobalData(now),
    },
    last_updated: now.toISOString(),
    note: token
      ? "Live global scrape unavailable right now. Showing fallback global market data."
      : "Set SCRAPE_DO_TOKEN in .env.local to enable live global equities data.",
  })
}

function extractGlobalStocksFromHtml(html: string, date: Date): GlobalStock[] {
  const $ = cheerio.load(html)
  const timestamp = date.toISOString()
  const rows: GlobalStock[] = []

  $("table > tbody > tr").each((_, row) => {
    const cells = $(row).find("td")
    if (cells.length < 4) {
      return
    }

    const values = cells
      .toArray()
      .map((cell) => normalizeText($(cell).text()))
      .filter(Boolean)

    if (values.length < 4) {
      return
    }

    const possibleName = values.find((value) => /[A-Za-z]{3,}/.test(value) && value.includes(" ")) || values[0]
    const priceText = values.find((value) => /\d/.test(value) && (value.includes(".") || value.includes(","))) || ""
    const changeText = values.find((value) => value.includes("%")) || "0%"
    const volumeText = values.find((value) => /[KMBTkmbt]/.test(value) || /^\d[\d,]*$/.test(value)) || "0"
    const symbol = inferSymbol(values, possibleName)

    const price = parseNumber(priceText)
    if (!Number.isFinite(price) || price <= 0) {
      return
    }

    const changePercent = parsePercent(changeText)
    const volume = parseShorthandNumber(volumeText)

    rows.push({
      symbol,
      name: possibleName || symbol,
      sector: inferSector(values),
      country: inferCountry(values),
      price,
      change_percent: changePercent,
      volume,
      market_cap: inferMarketCap(values),
      last_updated: timestamp,
    })
  })

  return dedupeBySymbol(rows).slice(0, 40)
}

function generateFallbackGlobalData(date: Date): GlobalStock[] {
  const timestamp = date.toISOString()

  return GLOBAL_FALLBACK_STOCKS.map((stock) => {
    const basePrice = 20 + Math.random() * 380
    const dailyChangePercent = +(((Math.random() - 0.5) * 5.2).toFixed(2))
    const volume = Math.floor(500_000 + Math.random() * 8_500_000)
    const marketCap = Math.floor(20_000_000_000 + Math.random() * 2_200_000_000_000)

    return {
      ...stock,
      price: +(basePrice * (1 + dailyChangePercent / 100)).toFixed(2),
      change_percent: dailyChangePercent,
      volume,
      market_cap: marketCap,
      last_updated: timestamp,
    }
  })
}

function dedupeBySymbol(items: GlobalStock[]) {
  const map = new Map<string, GlobalStock>()

  for (const item of items) {
    if (!map.has(item.symbol)) {
      map.set(item.symbol, item)
    }
  }

  return Array.from(map.values())
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/[^0-9,.-]/g, "").replace(/,/g, "")
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function parsePercent(value: string): number {
  const cleaned = value.replace(/[^0-9+.-]/g, "")
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseShorthandNumber(value: string): number {
  const normalized = value.trim()
  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)\s*([KMBTkmbt])?$/)

  if (match) {
    const base = Number.parseFloat(match[1])
    const suffix = match[2]?.toUpperCase()

    if (!Number.isFinite(base)) return 0
    if (suffix === "K") return Math.round(base * 1_000)
    if (suffix === "M") return Math.round(base * 1_000_000)
    if (suffix === "B") return Math.round(base * 1_000_000_000)
    if (suffix === "T") return Math.round(base * 1_000_000_000_000)
    return Math.round(base)
  }

  const parsed = Number.parseFloat(normalized.replace(/,/g, ""))
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function inferSymbol(values: string[], name: string): string {
  for (const value of values) {
    const match = value.match(/\b[A-Z]{1,6}\b/)
    if (match) {
      return match[0]
    }
  }

  const compact = name.toUpperCase().replace(/[^A-Z]/g, "")
  return compact.slice(0, 6) || "N/A"
}

function inferSector(values: string[]): string {
  const knownSectors = [
    "Technology",
    "Financials",
    "Healthcare",
    "Consumer Discretionary",
    "Consumer Staples",
    "Energy",
    "Industrials",
    "Materials",
    "Utilities",
    "Real Estate",
    "Communication Services",
  ]

  const joined = values.join(" | ").toLowerCase()
  const found = knownSectors.find((sector) => joined.includes(sector.toLowerCase()))
  return found || "Global Equity"
}

function inferCountry(values: string[]): string {
  const knownCountries = [
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "China",
    "Canada",
    "Netherlands",
    "Switzerland",
    "India",
    "Brazil",
  ]

  const joined = values.join(" | ").toLowerCase()
  const found = knownCountries.find((country) => joined.includes(country.toLowerCase()))
  return found || "Global"
}

function inferMarketCap(values: string[]): number {
  const capLike = values.find((value) => /\d/.test(value) && /[KMBTkmbt]/.test(value))
  return capLike ? parseShorthandNumber(capLike) : 0
}
