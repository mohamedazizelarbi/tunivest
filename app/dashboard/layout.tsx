import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { getCurrentUserProfile } from "@/lib/supabase/admin"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/auth/login');
    }

    const profile = await getCurrentUserProfile()

    if (profile?.is_admin) {
        return redirect('/admin');
    }

    // Check if onboarding is complete
    const { data: onboarding } = await supabase
        .from('user_profile')
        .select('completed_at')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if multiple rows exist

    if (!onboarding?.completed_at) {
        return redirect('/onboarding');
    }

    return (
        <div className="flex h-screen">
          <DashboardSidebar profile={profile} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
            <Toaster />
          </main>
        </div>
    )
}
