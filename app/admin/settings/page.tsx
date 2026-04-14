import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Shield, Bell } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Platform Settings</h1>
        <p className="text-muted-foreground">Configure system settings and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Platform Status</p>
                <p className="text-sm text-muted-foreground">Current operational status</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Temporarily disable access</p>
              </div>
              <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Registration</p>
                <p className="text-sm text-muted-foreground">Allow new user signups</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Database className="h-5 w-5" />
              Database Status
            </CardTitle>
            <CardDescription>Database health and connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Connection Status</p>
                <p className="text-sm text-muted-foreground">Supabase PostgreSQL</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">RLS Policies</p>
                <p className="text-sm text-muted-foreground">Row Level Security</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Realtime</p>
                <p className="text-sm text-muted-foreground">Live data subscriptions</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Authentication and access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Verification</p>
                <p className="text-sm text-muted-foreground">Require email confirmation</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Required</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Password Policy</p>
                <p className="text-sm text-muted-foreground">Minimum 6 characters</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enforced</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Session Duration</p>
                <p className="text-sm text-muted-foreground">Auto logout period</p>
              </div>
              <Badge variant="outline" className="text-muted-foreground">7 days</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Email and alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Welcome Email</p>
                <p className="text-sm text-muted-foreground">Send to new users</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Transaction Alerts</p>
                <p className="text-sm text-muted-foreground">Notify on purchases</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Admin Alerts</p>
                <p className="text-sm text-muted-foreground">System notifications</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
