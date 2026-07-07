import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let email: string, password: string
  try {
    const body = await req.json()
    email    = (body.email    ?? '').trim()
    password = (body.password ?? '')
  } catch {
    const form = await req.formData().catch(() => null)
    email    = ((form?.get('email')    as string) ?? '').trim()
    password = ((form?.get('password') as string) ?? '')
  }

  if (!email || !password) {
    return NextResponse.redirect(new URL('/sign-up?error=missing_fields', req.url))
  }

  if (password.length < 8) {
    return NextResponse.redirect(new URL('/sign-up?error=password_too_short', req.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    console.error('[auth/sign-up]', error.message)
    return NextResponse.redirect(new URL(`/sign-up?error=${encodeURIComponent(error.message)}`, req.url))
  }

  // Supabase sends an email confirmation link by default.
  // Redirect to a "check your email" message.
  return NextResponse.redirect(new URL('/sign-in?message=check_email', req.url))
}
