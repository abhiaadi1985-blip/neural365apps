import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — Stripe features will be disabled')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-05-27.dahlia',
      typescript: true,
    })
  : null

/**
 * Create a Stripe Checkout session for the premium subscription.
 * Uses Stripe Checkout (hosted) — no custom card form, minimal PCI scope.
 *
 * @param customerId  Existing Stripe customer ID (or undefined to create new)
 * @param priceId     Stripe Price ID from the dashboard
 * @param successUrl  Redirect after successful checkout
 * @param cancelUrl   Redirect if user cancels
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId?: string
  priceId:     string
  successUrl:  string
  cancelUrl:   string
}) {
  if (!stripe) throw new Error('Stripe is not configured')

  return stripe.checkout.sessions.create({
    mode:       'subscription',
    customer:   customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url:  cancelUrl,
    // Collect customer email if no customerId provided
    ...(customerId ? {} : { billing_address_collection: 'auto' }),
  })
}

/**
 * Check whether a user has an active subscription.
 * Always use the subscriptions DB table as source of truth — not a live Stripe call.
 * This helper is for Stripe-side verification only (e.g. in webhooks).
 */
export async function getSubscriptionStatus(stripeSubscriptionId: string) {
  if (!stripe) return null
  return stripe.subscriptions.retrieve(stripeSubscriptionId)
}
