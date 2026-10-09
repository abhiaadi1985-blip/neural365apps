import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    // Stripe not yet configured — show friendly message
    return NextResponse.redirect(new URL('/sign-up?error=payments_not_configured', req.url))
  }

  // Get the authenticated user
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/sign-in?redirect=/api/checkout', req.url))
  }

  // Look up existing Stripe customer ID
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const origin = req.nextUrl.origin

  try {
    const session = await createCheckoutSession({
      customerId:  sub?.stripe_customer_id,
      priceId:     process.env.STRIPE_PRICE_ID,
      successUrl:  `${origin}/account?checkout=success`,
      cancelUrl:   `${origin}/account`,
    })

    if (!session.url) {
      return NextResponse.redirect(new URL('/account?error=checkout_failed', req.url))
    }

    return NextResponse.redirect(session.url)
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.redirect(new URL('/account?error=checkout_failed', req.url))
  }
}
