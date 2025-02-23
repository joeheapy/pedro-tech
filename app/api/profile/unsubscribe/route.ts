import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { stripe } from '@/app/lib/stripe'
import { currentUser } from '@clerk/nextjs/server'

export async function POST() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the user's current subscription record via Prisma
    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    })

    if (!profile?.stripeSubscriptionId) {
      throw new Error('No active subscription found.')
    }

    const subscriptionId = profile.stripeSubscriptionId

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true, // or false to cancel immediately
      }
    )

    // Update the record in the DB
    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    })

    return NextResponse.json({ subscription: canceledSubscription })
  } catch (error) {
    console.error('Error unsubscribing:', error)

    // Handle Stripe errors
    if (error instanceof stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    // Handle Prisma errors
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: 'An unexpected error occurred while unsubscribing.' },
      { status: 500 }
    )
  }
}
