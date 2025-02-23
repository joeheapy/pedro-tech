import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { stripe } from '@/app/lib/stripe'
import { currentUser } from '@clerk/nextjs/server'
import { getPriceIdFromType } from '@/app/lib/plans'

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newPlan } = await request.json()
    if (!newPlan) {
      return NextResponse.json(
        { error: 'New plan is required.' },
        { status: 400 }
      )
    }

    // Fetch existing subscription
    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    })
    if (!profile?.stripeSubscriptionId) {
      throw new Error('No active subscription found.')
    }

    const subscriptionId = profile.stripeSubscriptionId

    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const subscriptionItemId = subscription.items.data[0]?.id
    if (!subscriptionItemId) {
      throw new Error('Subscription item not found.')
    }

    // Update subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: subscriptionItemId,
            price: getPriceIdFromType(newPlan),
          },
        ],
        proration_behavior: 'create_prorations',
      }
    )

    // Update Prisma
    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTier: newPlan,
        stripeSubscriptionId: updatedSubscription.id,
        subscriptionActive: true,
      },
    })

    return NextResponse.json({ subscription: updatedSubscription })
  } catch (error) {
    console.error('Error changing subscription plan:', error)

    // Handle Stripe errors
    if (error instanceof stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    // Handle other known errors
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
