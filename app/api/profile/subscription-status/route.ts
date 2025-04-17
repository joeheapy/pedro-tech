import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

interface Profile {
  id: string
  userId: string
  email: string
  subscriptionActive: boolean
  subscriptionTier: string | null
  stripeSubscriptionId: string | null
  cancellationRequested: boolean
  cancellationRequestedAt: Date | null
  subscriptionEndDate: Date | null
}

interface ProfileResponse {
  subscription: Profile | null
  error?: string
}

export async function GET(): Promise<NextResponse<ProfileResponse>> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser?.id) {
      return NextResponse.json<ProfileResponse>(
        { subscription: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
      select: {
        id: true,
        userId: true,
        email: true,
        subscriptionActive: true,
        subscriptionTier: true,
        stripeSubscriptionId: true,
        cancellationRequested: true,
        cancellationRequestedAt: true,
        subscriptionEndDate: true,
      },
    })

    return NextResponse.json<ProfileResponse>({ subscription: profile })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json<ProfileResponse>(
      { subscription: null, error: 'Failed to fetch subscription details.' },
      { status: 500 }
    )
  }
}
