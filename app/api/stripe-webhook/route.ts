// app/api/webhooks/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma' // <-- import Prisma client
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string

export async function POST(req: NextRequest) {
  const body = await req.text()
  // console.log('Received webhook body:', body)

  const signature = req.headers.get('stripe-signature')
  // console.log('Stripe signature:', signature)

  let event: Stripe.Event

  // Verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature || '', webhookSecret)
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Webhook signature verification failed. ${err.message}`)
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({})
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Stripe error: ${error.message} | EVENT TYPE: ${event.type}`
      )
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 })
  }
}

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  const userId = session.metadata?.clerkUserId
  console.log('Handling checkout.session.completed for user:', userId)

  if (!userId) {
    console.error('No userId found in session metadata.')
    return
  }

  // Retrieve subscription ID from the session
  const subscriptionId = session.subscription as string

  if (!subscriptionId) {
    console.error('No subscription ID found in session.')
    return
  }

  // Update Prisma with subscription details
  try {
    await prisma.profile.update({
      where: { userId },
      data: {
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: true,
        subscriptionTier: session.metadata?.planType || null,
      },
    })
    console.log(`Subscription activated for user: ${userId}`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Prisma Update Error:', error.message)
    } else {
      console.error('Prisma Update Error:', error)
    }
  }
}

// Handler for failed invoice payments
const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  const subscriptionId = invoice.subscription as string
  console.log(
    'Handling invoice.payment_failed for subscription:',
    subscriptionId
  )

  if (!subscriptionId) {
    console.error('No subscription ID found in invoice.')
    return
  }

  // Retrieve userId from subscription ID
  let userId: string | undefined
  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      select: { userId: true },
    })

    if (!profile?.userId) {
      console.error('No profile found for this subscription ID.')
      return
    }

    userId = profile.userId
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Prisma Query Error:', error.message)
    } else {
      console.error('Unknown Prisma Query Error:', String(error))
    }
    return
  }

  // Update Prisma with payment failure
  try {
    await prisma.profile.update({
      where: { userId },
      data: {
        subscriptionActive: false,
      },
    })
    console.log(`Subscription payment failed for user: ${userId}`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Prisma Update Error:', error.message)
    } else {
      console.error('Unknown Prisma Update Error:', String(error))
    }
  }
}

// Handler for subscription deletions (e.g., cancellations)
const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  const subscriptionId = subscription.id
  console.log(
    'Handling customer.subscription.deleted for subscription:',
    subscriptionId
  )

  // Retrieve userId from subscription ID
  let userId: string | undefined
  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      select: { userId: true },
    })

    if (!profile?.userId) {
      console.error('No profile found for this subscription ID.')
      return
    }

    userId = profile.userId
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Prisma Query Error:', error.message)
    } else {
      console.error('Unknown Prisma Query Error:', String(error))
    }
    return
  }

  // Update Prisma with subscription cancellation
  try {
    await prisma.profile.update({
      where: { userId },
      data: {
        subscriptionActive: false,
        stripeSubscriptionId: null,
      },
    })
    console.log(`Subscription canceled for user: ${userId}`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Prisma Update Error:', error.message)
      throw error // Re-throw to trigger error handling in main webhook handler
    } else {
      console.error('Unknown Prisma Update Error:', String(error))
      throw new Error('Failed to update subscription status')
    }
  }
}
