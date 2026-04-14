import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { InvestForm } from "@/components/dashboard/invest-form"

interface InvestPageProps {
  params: Promise<{ id: string }>
}

export default async function InvestPage({ params }: InvestPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: investment } = await supabase
    .from("investments")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!investment) {
    notFound()
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("salary, risk_profile")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Invest in {investment.name}</h1>
        <p className="text-muted-foreground">Complete your investment purchase</p>
      </div>

      <InvestForm investment={investment} userId={user.id} userProfile={profile} />
    </div>
  )
}
