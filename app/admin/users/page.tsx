import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const riskColors: Record<string, string> = {
  conservative: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  aggressive: "bg-red-100 text-red-800",
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">User Management</h1>
        <p className="text-muted-foreground">View and manage all registered users</p>
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
