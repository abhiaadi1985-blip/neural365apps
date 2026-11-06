import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSafeRedirectUrl } from '@/utils/url'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let email = ''
  let password = ''
  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await req.formData().catch(() => null)
    email = ((form?.get('email') as string) ?? '').trim()
    password = ((form?.get('password') as string) ?? '')
  } else {
    try {
      const body = await req.json()
      email = (body.email ?? '').trim()
      password = (body.password ?? '')
    } catch {
      email = ''
      password = ''
    }
  }

  if (!email || !password) {
    return NextResponse.redirect(getSafeRedirectUrl('/admin/login?error=missing_fields', req))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
          catch { /* server component context */ }
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('[auth/admin-sign-in]', error.message)
    return NextResponse.redirect(getSafeRedirectUrl(`/admin/login?error=${encodeURIComponent(error.message)}`, req))
  }

  // Verify the user has admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(getSafeRedirectUrl('/admin/login?error=auth_failed', req))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    // Not an admin — sign them out and reject
    await supabase.auth.signOut()
    return NextResponse.redirect(getSafeRedirectUrl('/admin/login?error=not_admin', req))
  }

  return NextResponse.redirect(getSafeRedirectUrl('/admin', req))
}
