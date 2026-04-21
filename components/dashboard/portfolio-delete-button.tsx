"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface PortfolioDeleteButtonProps {
  portfolioId: string
}

export function PortfolioDeleteButton({ portfolioId }: PortfolioDeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm("Remove this investment from your portfolio?")
    if (!confirmed) return

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", portfolioId)

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
      aria-label="Delete investment"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
