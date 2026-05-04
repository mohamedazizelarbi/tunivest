import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { requireAdminAuth } from "@/lib/supabase/admin"
import { createAdminClient } from "@/lib/supabase/admin-client"

const riskColors: Record<string, string> = {
  conservative: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  aggressive: "bg-red-100 text-red-800",
}

export default async function AdminUsersPage() {
  await requireAdminAuth()
  const supabase = createAdminClient()

  const allUsers = []
  const perPage = 100
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

    if (error) {
      throw new Error(error.message)
    }

    const usersPage = data.users ?? []
    allUsers.push(...usersPage)

    if (usersPage.length < perPage) {
      break
    }

    page += 1
  }

  const userIds = allUsers.map((user) => user.id)

  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, email, full_name, phone, salary, risk_profile, is_admin, created_at, updated_at")
        .in("id", userIds)
    : { data: [] }

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))

  const users = allUsers.map((authUser) => {
    const profile = profileById.get(authUser.id)

    return {
      id: authUser.id,
      email: profile?.email ?? authUser.email ?? "N/A",
      full_name:
        profile?.full_name ??
        (typeof authUser.user_metadata?.full_name === "string" ? authUser.user_metadata.full_name : null) ??
        (typeof authUser.user_metadata?.name === "string" ? authUser.user_metadata.name : null),
      phone: profile?.phone ?? null,
      salary: profile?.salary ?? null,
      risk_profile: profile?.risk_profile ?? "moderate",
      is_admin: profile?.is_admin ?? false,
      created_at: profile?.created_at ?? authUser.created_at,
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">View and monitor all registered users</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Users ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Phone</TableHead>
                  <TableHead className="text-muted-foreground">Salary</TableHead>
                  <TableHead className="text-muted-foreground">Risk Profile</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {user.full_name || "N/A"}
                    </TableCell>
                    <TableCell className="text-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.phone || "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.salary ? `${user.salary.toLocaleString()} TND` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={riskColors[user.risk_profile] || riskColors.moderate}>
                        {user.risk_profile}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge className="bg-primary/10 text-primary">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
