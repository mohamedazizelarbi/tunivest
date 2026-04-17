import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

const SCRAPE_DO_API_URL = "https://api.scrape.do"
const DEFAULT_INVESTING_URL = "https://www.investing.com/equities/tunisia"

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim()
}

function extractStockRows(html) {
  const $ = cheerio.load(html)
  const data = []

  $("table > tbody > tr").each((_, row) => {
    const cells = $(row).find("td")

    if (cells.length < 3) {
      return
    }

    const cellTexts = cells
      .toArray()
      .map((cell) => cleanText($(cell).text()))
      .filter(Boolean)

    if (cellTexts.length < 3) {
      return
    }

    const name = cellTexts[0]
    const price = cellTexts[1]

    // Prefer percentage-like values for change when available.
    const change =
      cellTexts.find((text) => text.includes("%")) ??
      cellTexts[2]

    data.push({
      name,
      price,
      change,
    })
  })

  return data
}

export async function GET(request) {
  const token = process.env.SCRAPE_DO_TOKEN
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get("url") || DEFAULT_INVESTING_URL

  if (!token) {
    return NextResponse.json(
      { error: "Missing SCRAPE_DO_TOKEN environment variable." },
      { status: 500 },
    )
  }

  try {
    const scrapeParams = new URLSearchParams({
      token,
      url: targetUrl,
      render: "true",
    })

    const response = await fetch(`${SCRAPE_DO_API_URL}/?${scrapeParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "text/html",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`scrape.do request failed with status ${response.status}`)
    }

    const html = await response.text()
    const stocks = extractStockRows(html)

    return NextResponse.json(stocks)
  } catch (error) {
    console.error("Scrape route error:", error)

    return NextResponse.json(
      { error: "Failed to fetch or parse Investing.com data." },
      { status: 500 },
    )
  }
}
