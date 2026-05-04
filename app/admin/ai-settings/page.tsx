import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { requireAdminAuth } from "@/lib/supabase/admin"
import { Zap, CheckCircle2, AlertCircle, Settings } from "lucide-react"

export default async function AdminAiSettingsPage() {
  await requireAdminAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI & Recommendations</h1>
        <p className="text-muted-foreground">Configure AI-powered recommendation settings</p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          AI recommendations are powered by Zapier webhooks. These settings control how user profiles and investments are sent to the recommendation engine.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Zap className="h-5 w-5 text-primary" />
              Zapier Integration
            </CardTitle>
            <CardDescription>
              External AI recommendation engine configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <p className="font-medium text-foreground">Webhook Status</p>
                  <p className="text-sm text-muted-foreground">
                    Connection to Zapier AI service
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
              </div>

              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <p className="font-medium text-foreground">Recommendation Engine</p>
                  <p className="text-sm text-muted-foreground">
                    Generate structured investment recommendations
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Enabled
                </Badge>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">Payload Format</p>
                  <p className="text-sm text-muted-foreground">
                    Latest version with enhanced profile data
                  </p>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  v2.0
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5" />
              Recommendation Parameters
            </CardTitle>
            <CardDescription>
              Configure how recommendations are generated for users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <p className="font-medium text-foreground">User Profile Data</p>
                  <p className="text-sm text-muted-foreground">
                    Sent to Zapier for recommendation generation
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  Enabled
                </Badge>
              </div>

              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <p className="font-medium text-foreground">Investment Filtering</p>
                  <p className="text-sm text-muted-foreground">
                    Limited to 5-10 top candidates per request
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">Fallback Recommendations</p>
                  <p className="text-sm text-muted-foreground">
                    Provided when Zapier is unavailable
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Configured
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Data & Privacy
            </CardTitle>
            <CardDescription>
              Manage how user data is handled in recommendation generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <p className="font-medium text-foreground">Profile Data Sharing</p>
                  <p className="text-sm text-muted-foreground">
                    User profile and onboarding data shared with Zapier
                  </p>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  Required
                </Badge>
              </div>

              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <p className="font-medium text-foreground">Investment History</p>
                  <p className="text-sm text-muted-foreground">
                    Current portfolio included for context
                  </p>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  Optional
                </Badge>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">Data Retention</p>
                  <p className="text-sm text-muted-foreground">
                    Zapier retains request data per their privacy policy
                  </p>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  Third-party
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">How It Works</CardTitle>
            <CardDescription>
              AI recommendation flow in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-fit">1.</span>
                <span>User completes onboarding profile with risk tolerance and goals</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-fit">2.</span>
                <span>Platform filters investments matching user criteria (5-10 candidates)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-fit">3.</span>
                <span>Profile and investment data sent to Zapier webhook</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-fit">4.</span>
                <span>AI generates structured recommendations with reasons and expected returns</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary min-w-fit">5.</span>
                <span>Recommendations displayed to user with fallback if service unavailable</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
