"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { InvestmentForm } from "@/components/admin/investment-form"
import { createInvestment, updateInvestment, deleteInvestment } from "@/app/admin/investments/actions"
import type { Investment } from "@/lib/types"
import { Plus, Edit2, Trash2 } from "lucide-react"

interface InvestmentsListClientProps {
  initialInvestments: Investment[]
}

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

export function InvestmentsListClient({ initialInvestments }: InvestmentsListClientProps) {
  const router = useRouter()
  const [investments, setInvestments] = useState(initialInvestments)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenForm = (investment?: Investment) => {
    setSelectedInvestment(investment || null)
    setFormOpen(true)
  }

  const handleSubmitForm = async (data: Partial<Investment>) => {
    setIsLoading(true)
    try {
      if (selectedInvestment?.id) {
        await updateInvestment(selectedInvestment.id, data)
        toast.success("Investment updated successfully")
      } else {
        await createInvestment(data)
        toast.success("Investment created successfully")
      }
      router.refresh()
      setFormOpen(false)
      setSelectedInvestment(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save investment"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    
    setIsLoading(true)
    try {
      await deleteInvestment(deleteId)
      toast.success("Investment deleted successfully")
      router.refresh()
      setDeleteOpen(false)
      setDeleteId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete investment"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">
            All Investments ({investments?.length || 0})
          </CardTitle>
          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Investment
          </Button>
        </CardHeader>
        <CardContent>
          {investments && investments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-right text-muted-foreground">Min Amount</TableHead>
                    <TableHead className="text-right text-muted-foreground">Return</TableHead>
                    <TableHead className="text-muted-foreground">Risk</TableHead>
                    <TableHead className="text-right text-muted-foreground">Duration</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((inv) => (
                    <TableRow key={inv.id} className="border-border">
                      <TableCell className="font-medium text-foreground max-w-xs truncate">
                        {inv.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-muted-foreground">
                          {categoryLabels[inv.category] || inv.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        {inv.min_amount.toLocaleString()} TND
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        {inv.expected_return}%
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(inv.risk_level)}>
                          {inv.risk_level}/10
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {inv.duration_months} mo.
                      </TableCell>
                      <TableCell>
                        {inv.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenForm(inv)}
                            className="gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(inv.id)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No investments found.</p>
              <Button onClick={() => handleOpenForm()} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Investment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <InvestmentForm
        investment={selectedInvestment}
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmitForm}
        isLoading={isLoading}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The investment will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
