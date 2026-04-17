"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import type { Profile } from "@/lib/types"
import { User, Shield, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProfileFormProps {
  profile: Profile | null
}

const riskProfileConfig: Record<string, { label: string; color: string; description: string }> = {
  conservative: {
    label: "Conservative",
    color: "bg-green-100 text-green-800",
    description: "Low-risk investments with stable returns",
  },
  moderate: {
    label: "Moderate",
    color: "bg-yellow-100 text-yellow-800",
    description: "Balanced portfolio with moderate risk",
  },
  aggressive: {
    label: "Aggressive",
    color: "bg-red-100 text-red-800",
    description: "High-risk investments with potential high returns",
  },
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [salary, setSalary] = useState(profile?.salary?.toString() || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const riskConfig = riskProfileConfig[profile?.risk_profile || "moderate"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        phone: phone || null,
        salary: salary ? parseFloat(salary) : null,
      })
      .eq("id", profile?.id)

    if (error) {
      setMessage({ type: "error", text: error.message })
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" })
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4">
              {message && (
                <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {message.text}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ahmed Ben Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="salary">Monthly Salary (TND)</FieldLabel>
                <Input
                  id="salary"
                  type="number"
                  placeholder="2000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Used to calculate your risk profile
                </p>
              </Field>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5" />
            Risk Profile
          </CardTitle>
          <CardDescription>Your investment risk assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-6 text-center">
            <Badge className={`${riskConfig.color} text-lg px-4 py-2`}>
              {riskConfig.label}
            </Badge>
            <p className="mt-4 text-muted-foreground">
              {riskConfig.description}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">How is this calculated?</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Based on your monthly salary
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Conservative if salary is below 1,500 TND
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Moderate if salary is between 1,500 - 3,000 TND
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Aggressive if salary is above 3,000 TND
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Account created:</strong>{" "}
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
