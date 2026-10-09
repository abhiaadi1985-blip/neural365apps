import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

function periodEnd(sub: Stripe.Subscription): string {
  // current_period_end is a Unix timestamp (seconds)
  // In the new Stripe SDK the field is typed as a number on Subscription
  const ts = (sub as unknown as { current_period_end: number }).current_period_end
  return new Date(ts * 1000).toISOString()
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''
  const secret    = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      // stripe.subscriptions.retrieve returns Response<Subscription> — unwrap to plain object
      const rawSub = await stripe.subscriptions.retrieve(session.subscription as string)
      const sub = rawSub as unknown as Stripe.Subscription
      const userId = session.metadata?.supabase_user_id

      if (!userId) {
        console.warn('[stripe/webhook] checkout.session.completed: no supabase_user_id in metadata')
        break
      }

      await supabase.from('subscriptions').upsert({
        user_id:                userId,
        stripe_customer_id:     sub.customer as string,
        stripe_subscription_id: sub.id,
        status:                 sub.status,
        current_period_end:     periodEnd(sub),
      }, { onConflict: 'stripe_subscription_id' })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as unknown as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({
          status:             sub.status,
          current_period_end: periodEnd(sub),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as unknown as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
