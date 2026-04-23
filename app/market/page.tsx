import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MarketOverview } from "@/components/market/market-overview"
import { BVMTTable } from "@/components/market/bvmt-table"
import { CryptoTable } from "@/components/market/crypto-table"
import { CryptoCharts } from "@/components/market/crypto-charts"
import { BitcoinChart } from "@/components/market/bitcoin-chart"
import { ChartsTab } from "@/components/market/charts-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Bitcoin, LineChart, BarChart3 } from "lucide-react"

export default async function MarketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("email, full_name, is_admin")
      .eq("id", user.id)
      .single()
    profile = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
                <LineChart className="h-4 w-4" />
                Real-Time Market Data
              </div>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Live Market Data
              </h1>
              <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
                Track Tunisian stocks, cryptocurrency prices, and technical charts in real-time.
                Make informed investment decisions with up-to-date market information.
              </p>
            </div>
          </div>
        </section>

        {/* Market Content */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-12">
            {/* Market Overview */}
            <MarketOverview />

            {/* Market Data Tabs */}
            <Tabs defaultValue="bvmt" className="space-y-6">
              <TabsList className="grid w-full max-w-4xl grid-cols-1 sm:grid-cols-3">
                <TabsTrigger value="bvmt" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  BVMT Stocks
                </TabsTrigger>
                <TabsTrigger value="crypto" className="gap-2">
                  <Bitcoin className="h-4 w-4" />
                  Cryptocurrency
                </TabsTrigger>
                <TabsTrigger value="charts" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Global Market
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bvmt">
                <BVMTTable />
              </TabsContent>

              <TabsContent value="crypto">
                <div className="space-y-6">
                  {/* Crypto Table on Left, Other 4 Charts on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Crypto Table - Left side (50% width) */}
                    <div>
                      <CryptoTable />
                    </div>
                    
                    {/* Other 4 Crypto Charts - Right side (50% width, 2x2 grid inside) */}
                    <div>
                      <CryptoCharts />
                    </div>
                  </div>

                  {/* Bitcoin Chart - Full Width Below */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bitcoin className="h-5 w-5" />
                        Bitcoin (BTC/USDT)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BitcoinChart height={350} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <ChartsTab />
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> Market data is provided for informational purposes only. 
                BVMT/Tunisia equities data is scraped from Investing.com via scrape.do when configured, with fallback data shown if live scraping is unavailable. 
                Cryptocurrency data is sourced from CoinMarketCap API (demo data shown without API key). 
                Global markets visibility in the Charts tab is rendered via TradingView widgets.
                Always do your own research before making investment decisions. 
                Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
