"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Investment } from "@/lib/types"

interface InvestmentFormProps {
  investment?: Investment | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Investment>) => Promise<void>
  isLoading?: boolean
}

const categories = ["bonds", "stocks", "funds", "real_estate", "crypto"]

export function InvestmentForm({
  investment,
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: InvestmentFormProps) {
  const [formData, setFormData] = useState<Partial<Investment>>(
    investment || {
      name: "",
      description: "",
      category: "stocks",
      min_amount: 0,
      expected_return: 0,
      risk_level: 5,
      duration_months: 12,
      is_active: true,
    }
  )

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      onOpenChange(false)
      setFormData({
        name: "",
        description: "",
        category: "stocks",
        min_amount: 0,
        expected_return: 0,
        risk_level: 5,
        duration_months: 12,
        is_active: true,
      })
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {investment ? "Edit Investment" : "Add New Investment"}
          </DialogTitle>
          <DialogDescription>
            {investment
              ? "Update the investment details below."
              : "Create a new investment product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Investment Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="e.g., Tech Growth Fund"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={e => handleChange("description", e.target.value)}
              placeholder="Investment details and strategy..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || "stocks"}
                onValueChange={value => handleChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk">Risk Level (1-10)</Label>
              <Input
                id="risk"
                type="number"
                min="1"
                max="10"
                value={formData.risk_level || 5}
                onChange={e => handleChange("risk_level", parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_amount">Min Amount (TND)</Label>
              <Input
                id="min_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_amount || 0}
                onChange={e => handleChange("min_amount", parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="return">Expected Return (%)</Label>
              <Input
                id="return"
                type="number"
                step="0.1"
                min="0"
                value={formData.expected_return || 0}
                onChange={e => handleChange("expected_return", parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration_months || 12}
                onChange={e => handleChange("duration_months", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <Select
                value={String(formData.is_active ?? true)}
                onValueChange={value => handleChange("is_active", value === "true")}
              >
                <SelectTrigger id="active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : investment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
