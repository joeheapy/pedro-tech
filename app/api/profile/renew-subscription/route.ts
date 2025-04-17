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
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 400 }
      )
    }

    const subscriptionId = profile.stripeSubscriptionId

    try {
      // Remove the cancellation flag in Stripe
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: false,
        }
      )

      // Update the record in the DB - remove cancellation flags
      await prisma.profile.update({
        where: { userId: clerkUser.id },
        data: {
          cancellationRequested: false,
          cancellationRequestedAt: null,
          subscriptionEndDate: null,
        },
      })

      return NextResponse.json({ subscription: updatedSubscription })
    } catch (error) {
      // Add specific handling for already-cancelled subscriptions
      if (
        error instanceof stripe.errors.StripeError &&
        error.message.includes('canceled subscription')
      ) {
        // Clear subscription data but keep profile
        await prisma.profile.update({
          where: { userId: clerkUser.id },
          data: {
            subscriptionTier: null,
            subscriptionActive: false,
            stripeSubscriptionId: null,
            cancellationRequested: false,
            cancellationRequestedAt: null,
            subscriptionEndDate: null,
          },
        })

        return NextResponse.json(
          {
            redirectToSubscribe: true,
            error: 'Your subscription has expired. Please select a new plan.',
          },
          { status: 400 }
        )
      }
      // Rest of error handling...
      console.error('Error renewing subscription:', error)

      // Handle Stripe errors
      if (error instanceof stripe.errors.StripeError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode || 500 }
        )
      }

      // Handle other errors
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(
        {
          error:
            'An unexpected error occurred while renewing your subscription.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error renewing subscription:', error)

    // Handle Stripe errors
    if (error instanceof stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    // Handle other errors
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred while renewing your subscription.',
      },
      { status: 500 }
    )
  }
}
