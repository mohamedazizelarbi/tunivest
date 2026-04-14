import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { StatsSection } from "@/components/home/stats-section"
import { CTASection } from "@/components/home/cta-section"

export default async function HomePage() {
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
        <HeroSection isLoggedIn={!!user} />
        <FeaturesSection />
        <StatsSection />
        <CTASection isLoggedIn={!!user} />
      </main>
      <Footer />
    </div>
  )
}
