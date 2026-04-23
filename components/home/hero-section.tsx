import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import TradingViewNewsWidget from "@/components/home/tradingview-news-widget"

interface HeroSectionProps {
  isLoggedIn: boolean
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12 lg:py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2">
              <span className="text-xs font-medium text-secondary-foreground bg-secondary px-2 py-0.5 rounded-full">
                New
              </span>
              <span className="text-sm text-muted-foreground">
                AI-Powered Investment Recommendations
              </span>
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Invest Smarter in{" "}
              <span className="text-primary">Tunisia</span>
            </h1>

            <p className="max-w-xl text-pretty text-lg text-muted-foreground">
              TuniVest helps you build wealth with intelligent portfolio management, 
              personalized recommendations, and real-time market insights tailored 
              for the Tunisian market.
            </p>

            <div className="flex flex-wrap gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="gap-2">
                      Start Investing
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/investments">
                    <Button variant="outline" size="lg">
                      Explore Investments
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Secure & Regulated</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-secondary-foreground" />
                <span className="text-sm text-muted-foreground">Real-time Data</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">AI Insights</span>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/15 to-secondary/20 blur-2xl" />
              <div className="relative">
                <TradingViewNewsWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
