"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/supabase/admin"
import type { Investment } from "@/lib/types"

export async function createInvestment(data: Partial<Investment>) {
  await requireAdminAuth()
  
  const supabase = await createClient()

  const { error } = await supabase
    .from("investments")
    .insert({
      name: data.name,
      description: data.description,
      category: data.category,
      min_amount: data.min_amount,
      expected_return: data.expected_return,
      risk_level: data.risk_level,
      duration_months: data.duration_months,
      is_active: data.is_active ?? true,
    })

  if (error) throw new Error(error.message)

  revalidatePath("/admin/investments")
}

export async function updateInvestment(id: string, data: Partial<Investment>) {
  await requireAdminAuth()

  const supabase = await createClient()

  const { error } = await supabase
    .from("investments")
    .update({
      name: data.name,
      description: data.description,
      category: data.category,
      min_amount: data.min_amount,
      expected_return: data.expected_return,
      risk_level: data.risk_level,
      duration_months: data.duration_months,
      is_active: data.is_active,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/investments")
}

export async function deleteInvestment(id: string) {
  await requireAdminAuth()

  const supabase = await createClient()

  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/investments")
}
