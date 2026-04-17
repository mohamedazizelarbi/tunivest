import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

const SCRAPE_DO_API_URL = "https://api.scrape.do"
const INVESTING_TUNISIA_URL = "https://www.investing.com/equities/tunisia"

// BVMT Stock Data - Tunisian Stock Exchange
export interface BVMTStock {
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  change_percent: number
  open: number
  high: number
  low: number
  volume: number
  last_updated: string
}

export interface BVMTIndex {
  name: string
  value: number
  change: number
  change_percent: number
  last_updated: string
}

// Real Tunisian companies listed on BVMT
const TUNISIAN_STOCKS: BVMTStock[] = [
  // Banking Sector
  { symbol: "BIAT", name: "Banque Internationale Arabe de Tunisie", sector: "Banking", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "BNA", name: "Banque Nationale Agricole", sector: "Banking", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "BH", name: "BH Bank", sector: "Banking", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "STB", name: "Société Tunisienne de Banque", sector: "Banking", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "ATB", name: "Arab Tunisian Bank", sector: "Banking", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "UBCI", name: "Union Bancaire pour le Commerce et l'Industrie", sector: "Banking", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "UIB", name: "Union Internationale de Banques", sector: "Banking", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "AMEN", name: "Amen Bank", sector: "Banking", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  // Insurance
  { symbol: "STAR", name: "Société Tunisienne d'Assurances et de Réassurances", sector: "Insurance", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "ASTREE", name: "Assurances Astree", sector: "Insurance", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "MAG", name: "Assurances Maghrebia", sector: "Insurance", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "AMV", name: "Assurances Maghrebia Vie", sector: "Insurance", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  // Industry
  { symbol: "SFBT", name: "Société de Fabrication des Boissons de Tunisie", sector: "Industry", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "PGH", name: "Poulina Group Holding", sector: "Industry", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "DELICE", name: "Délice Holding", sector: "Industry", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "LAND", name: "Land'Or", sector: "Industry", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "TPR", name: "TPR - Tunisie Profilés Réunis", sector: "Industry", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  // Technology
  { symbol: "TELNET", name: "Telnet Holding", sector: "Technology", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "SMART", name: "Smart Tunisie", sector: "Technology", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "CELLCOM", name: "Cellcom", sector: "Technology", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  // Leasing
  { symbol: "ATL", name: "Arab Tunisian Lease", sector: "Leasing", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "CIL", name: "Compagnie Internationale de Leasing", sector: "Leasing", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "HANNIBAL", name: "Hannibal Lease", sector: "Leasing", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  // Distribution
  { symbol: "MONOPRIX", name: "Monoprix Tunisie", sector: "Distribution", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
  { symbol: "MAGASIN", name: "Magasin Général", sector: "Distribution", price: 0, change: 0, change_percent: 0, open: 0, high: 0, low: 0, volume: 0, last_updated: "" },
]

export async function GET() {
  const now = new Date()
  const isMarketOpen = isWithinTradingHours(now)
  const token = process.env.SCRAPE_DO_TOKEN

  if (token) {
    try {
      const scrapeParams = new URLSearchParams({
        token,
        url: INVESTING_TUNISIA_URL,
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
        const stocks = extractBVMTStocksFromHtml(html, now)

        if (stocks.length > 0) {
          const indices = generateIndices(stocks, now)

          return NextResponse.json({
            success: true,
            source: "investing-scrape-do",
            market_status: isMarketOpen ? "open" : "closed",
            trading_hours: "09:00 - 14:00 CET (Tunisian Market)",
            data: {
              stocks,
              indices,
            },
            last_updated: now.toISOString(),
            note: "Live Tunisia equities data scraped from Investing.com via scrape.do.",
          })
        }
      }
    } catch (error) {
      console.error("BVMT scrape failed, falling back to simulated data:", error)
    }
  }

  const stocks = generateRealisticStockData(now)
  const indices = generateIndices(stocks, now)

  return NextResponse.json({
    success: true,
    source: "bvmt-fallback",
    market_status: isMarketOpen ? "open" : "closed",
    trading_hours: "09:00 - 14:00 CET (Tunisian Market)",
    data: {
      stocks,
      indices,
    },
    last_updated: now.toISOString(),
    note: token
      ? "Live scrape unavailable right now. Showing fallback data."
      : "Set SCRAPE_DO_TOKEN in .env.local to enable live Tunisia equities data.",
  })
}

function extractBVMTStocksFromHtml(html: string, date: Date): BVMTStock[] {
  const $ = cheerio.load(html)
  const rows: BVMTStock[] = []
  const timestamp = date.toISOString()

  $("table > tbody > tr").each((_, row) => {
    const cells = $(row).find("td")
    if (cells.length < 3) {
      return
    }

    const values = cells
      .toArray()
      .map((cell) => normalizeText($(cell).text()))
      .filter(Boolean)

    if (values.length < 3) {
      return
    }

    const name = values[0]
    const priceText = values[1]
    const changeText = values.find((value) => value.includes("%")) ?? values[2]
    const price = parseNumber(priceText)
    const changePercent = parsePercent(changeText)

    if (!name || !Number.isFinite(price)) {
      return
    }

    const symbol = inferSymbol(name, values)
    const change = +((price * changePercent) / 100).toFixed(2)

    rows.push({
      symbol,
      name,
      sector: "Unknown",
      price,
      change,
      change_percent: changePercent,
      open: price,
      high: price,
      low: price,
      volume: 0,
      last_updated: timestamp,
    })
  })

  return rows.slice(0, 50)
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

function inferSymbol(name: string, values: string[]): string {
  for (const value of values) {
    const match = value.match(/\b[A-Z]{2,6}\b/)
    if (match) {
      return match[0]
    }
  }

  const compact = name.toUpperCase().replace(/[^A-Z]/g, "")
  return compact.slice(0, 6) || "N/A"
}

function isWithinTradingHours(date: Date): boolean {
  const day = date.getDay()
  // Closed on weekends
  if (day === 0 || day === 6) return false
  
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const currentMinutes = hours * 60 + minutes
  
  // BVMT trading hours: 9:00 AM - 2:00 PM local time
  const openTime = 9 * 60 // 9:00 AM
  const closeTime = 14 * 60 // 2:00 PM
  
  return currentMinutes >= openTime && currentMinutes <= closeTime
}

function generateRealisticStockData(date: Date): BVMTStock[] {
  const timestamp = date.toISOString()
  
  // Realistic base prices for Tunisian stocks (in TND)
  const basePrices: Record<string, number> = {
    BIAT: 108.50, BNA: 8.20, BH: 12.40, STB: 3.85, ATB: 2.95, UBCI: 24.60, UIB: 18.30, AMEN: 36.50,
    STAR: 135.00, ASTREE: 42.80, MAG: 28.50, AMV: 8.90,
    SFBT: 18.40, PGH: 12.60, DELICE: 15.80, LAND: 9.20, TPR: 7.50,
    TELNET: 8.70, SMART: 5.40, CELLCOM: 3.20,
    ATL: 2.85, CIL: 12.50, HANNIBAL: 6.80,
    MONOPRIX: 5.60, MAGASIN: 22.40,
  }
  
  return TUNISIAN_STOCKS.map(stock => {
    const basePrice = basePrices[stock.symbol] || 10.00
    
    // Generate daily variation (-3% to +3%)
    const dailyChange = (Math.random() - 0.5) * 0.06
    const price = +(basePrice * (1 + dailyChange)).toFixed(2)
    const change = +(price - basePrice).toFixed(2)
    const changePercent = +((change / basePrice) * 100).toFixed(2)
    
    // Generate OHLV data
    const volatility = basePrice * 0.02
    const open = +(basePrice + (Math.random() - 0.5) * volatility).toFixed(2)
    const high = +(Math.max(price, open) + Math.random() * volatility * 0.5).toFixed(2)
    const low = +(Math.min(price, open) - Math.random() * volatility * 0.5).toFixed(2)
    
    // Volume based on stock popularity
    const baseVolume = stock.sector === "Banking" ? 50000 : stock.sector === "Industry" ? 30000 : 15000
    const volume = Math.floor(baseVolume * (0.5 + Math.random()))
    
    return {
      ...stock,
      price,
      change,
      change_percent: changePercent,
      open,
      high,
      low,
      volume,
      last_updated: timestamp,
    }
  })
}

function generateIndices(stocks: BVMTStock[], date: Date): BVMTIndex[] {
  const timestamp = date.toISOString()
  
  // Calculate TUNINDEX (weighted average of all stocks)
  const totalValue = stocks.reduce((sum, s) => sum + s.price * s.volume, 0)
  const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0)
  const avgChange = stocks.reduce((sum, s) => sum + s.change_percent, 0) / stocks.length
  
  const tunindexBase = 9200
  const tunindexValue = +(tunindexBase * (1 + avgChange / 100)).toFixed(2)
  const tunindexChange = +(tunindexValue - tunindexBase).toFixed(2)
  
  // Banking sector index
  const bankingStocks = stocks.filter(s => s.sector === "Banking")
  const bankingChange = bankingStocks.reduce((sum, s) => sum + s.change_percent, 0) / bankingStocks.length
  const bankingBase = 2850
  const bankingValue = +(bankingBase * (1 + bankingChange / 100)).toFixed(2)
  
  // Industry sector index
  const industryStocks = stocks.filter(s => s.sector === "Industry")
  const industryChange = industryStocks.reduce((sum, s) => sum + s.change_percent, 0) / industryStocks.length
  const industryBase = 3420
  const industryValue = +(industryBase * (1 + industryChange / 100)).toFixed(2)
  
  return [
    {
      name: "TUNINDEX",
      value: tunindexValue,
      change: tunindexChange,
      change_percent: +avgChange.toFixed(2),
      last_updated: timestamp,
    },
    {
      name: "TUNINDEX 20",
      value: +(tunindexValue * 0.85).toFixed(2),
      change: +(tunindexChange * 0.9).toFixed(2),
      change_percent: +(avgChange * 0.95).toFixed(2),
      last_updated: timestamp,
    },
    {
      name: "Banking Index",
      value: bankingValue,
      change: +(bankingValue - bankingBase).toFixed(2),
      change_percent: +bankingChange.toFixed(2),
      last_updated: timestamp,
    },
    {
      name: "Industry Index",
      value: industryValue,
      change: +(industryValue - industryBase).toFixed(2),
      change_percent: +industryChange.toFixed(2),
      last_updated: timestamp,
    },
  ]
}
