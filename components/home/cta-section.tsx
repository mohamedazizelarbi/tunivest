import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface CTASectionProps {
  isLoggedIn: boolean
}

export function CTASection({ isLoggedIn }: CTASectionProps) {
  if (isLoggedIn) return null

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center lg:px-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
          </div>

          <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
            Join thousands of Tunisians who are already building their wealth with TuniVest. 
            Sign up today and get personalized investment recommendations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary" className="gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/investments">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
