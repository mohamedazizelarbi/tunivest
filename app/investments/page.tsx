import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InvestmentsList } from "@/components/investments/investments-list"
import { InvestmentFilters } from "@/components/investments/investment-filters"

export default async function InvestmentsPage() {
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

  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center space-y-4">
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Investment Opportunities
              </h1>
              <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
                Explore our curated selection of investment products tailored for the Tunisian market.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-4">
              <aside className="lg:col-span-1">
                <InvestmentFilters />
              </aside>
              <div className="lg:col-span-3">
                <InvestmentsList investments={investments || []} isLoggedIn={!!user} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
