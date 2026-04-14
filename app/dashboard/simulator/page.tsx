import { createClient } from "@/lib/supabase/server"
import { SimulatorForm } from "@/components/dashboard/simulator-form"

export default async function SimulatorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Investment Simulator</h1>
        <p className="text-muted-foreground">
          Calculate potential returns before making real investments
        </p>
      </div>

      <SimulatorForm investments={investments || []} userId={user.id} />
    </div>
  )
}
