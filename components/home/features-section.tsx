import { Brain, LineChart, Wallet, Shield, Bell, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "AI Recommendations",
    description: "Get personalized investment suggestions based on your risk profile, salary, and financial goals.",
  },
  {
    icon: LineChart,
    title: "Portfolio Analytics",
    description: "Track your investments with detailed analytics, performance metrics, and trend analysis.",
  },
  {
    icon: Wallet,
    title: "Diverse Options",
    description: "Access bonds, stocks, funds, real estate, and more investment opportunities in Tunisia.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Automatic risk profiling ensures your investments match your financial situation.",
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Stay informed with notifications about market changes and investment opportunities.",
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Access to financial advisors and a community of fellow investors for guidance.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 space-y-3 text-center lg:mb-12">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Invest Wisely
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            TuniVest provides all the tools and insights you need to make informed 
            investment decisions in the Tunisian market.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
