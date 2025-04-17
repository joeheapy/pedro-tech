import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'
import { stripe } from '@/app/lib/stripe'

export async function DELETE() {
  try {
    const userAuth = await auth()
    const { userId } = userAuth

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user has an active subscription before canceling in Stripe
    if (profile.subscriptionActive && profile.stripeSubscriptionId) {
      try {
        // Cancel the subscription in Stripe IMMEDIATELY
        await stripe.subscriptions.cancel(profile.stripeSubscriptionId)
        console.log(
          `Cancelled subscription: ${profile.stripeSubscriptionId} for user: ${userId}`
        )
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError)
        // Continue with account deletion even if subscription cancellation fails
      }
    } else {
      console.log(`No active subscription to cancel for user: ${userId}`)
    }

    // Delete the profile - cascade will handle deleting all related data
    await prisma.profile.delete({
      where: { id: profile.id },
    })

    // Add a flag to indicate account deletion was successful
    return NextResponse.json({
      success: true,
      accountDeleted: true,
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
