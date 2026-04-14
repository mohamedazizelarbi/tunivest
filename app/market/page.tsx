import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MarketOverview } from "@/components/market/market-overview"
import { BVMTTable } from "@/components/market/bvmt-table"
import { CryptoTable } from "@/components/market/crypto-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Bitcoin, LineChart } from "lucide-react"

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
                Track Tunisian stocks from BVMT and global cryptocurrency prices in real-time. 
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
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="bvmt" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  BVMT Stocks
                </TabsTrigger>
                <TabsTrigger value="crypto" className="gap-2">
                  <Bitcoin className="h-4 w-4" />
                  Cryptocurrency
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bvmt">
                <BVMTTable />
              </TabsContent>

              <TabsContent value="crypto">
                <CryptoTable />
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> Market data is provided for informational purposes only. 
                BVMT data is simulated based on real market patterns - for production use, connect to official BVMT data feeds. 
                Cryptocurrency data is sourced from CoinMarketCap API (demo data shown without API key). 
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
