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

    // Check if user has an active subscription
    if (profile.stripeSubscriptionId) {
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
    }

    // Delete all associated data (projects, journey steps, business pains, etc.)
    await prisma.$transaction(async (tx) => {
      // Delete any business pains
      await tx.businesspains.deleteMany({
        where: {
          project: {
            profileId: profile.id,
          },
        },
      })

      // Delete all projects belonging to the user
      await tx.project.deleteMany({
        where: {
          profileId: profile.id,
        },
      })

      // Delete the profile itself
      await tx.profile.delete({
        where: { id: profile.id },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
