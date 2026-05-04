import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const RESERVED_ADMIN_EMAILS = new Set(['admin67@gmail.com'])

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.redirect(`${origin}/auth/login`)
      }

      if (user.email && RESERVED_ADMIN_EMAILS.has(user.email.toLowerCase())) {
        return NextResponse.redirect(`${origin}/admin`)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      let effectiveProfile = profile

      if (!effectiveProfile?.is_admin && user.email) {
        const { data: emailProfile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('email', user.email)
          .maybeSingle()

        effectiveProfile = emailProfile ?? effectiveProfile
      }

      if (effectiveProfile?.is_admin) {
        return NextResponse.redirect(`${origin}/admin`)
      }

      const { data: onboarding } = await supabase
        .from('user_profile')
        .select('completed_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!onboarding?.completed_at) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
