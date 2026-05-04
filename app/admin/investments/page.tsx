import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { requireAdminAuth } from "@/lib/supabase/admin"
import { InvestmentsListClient } from "@/components/admin/investments-list-client"

const categoryLabels: Record<string, string> = {
  bonds: "Bonds",
  stocks: "Stocks",
  funds: "Funds",
  real_estate: "Real Estate",
  crypto: "Crypto",
}

const getRiskColor = (risk: number) => {
  if (risk <= 3) return "bg-green-100 text-green-800"
  if (risk <= 6) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

export default async function AdminInvestmentsPage() {
  await requireAdminAuth()
  const supabase = await createClient()

  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investment Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage investment products</p>
      </div>

      <InvestmentsListClient initialInvestments={investments || []} />
    </div>
  )
}
