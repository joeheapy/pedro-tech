import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

// This file completes some checks and creates a profile for the user in the database.
// It is called when the user signs up for the first time.

// Check if the user is signed in and create a profile for them
export async function POST() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in Clerk.' },
        { status: 404 }
      )
    }
    // Check if the user has an email address.
    // If not, return an error. We need an email address to create a profile.
    const email = clerkUser.emailAddresses?.[0]?.emailAddress
    console.log('Email:', email)
    if (!email) {
      return NextResponse.json(
        { error: 'User does not have an email address.' },
        { status: 400 }
      )
    }

    // Check if profile already exists using findUnique.
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    })

    if (existingProfile) {
      // Profile already exists
      return NextResponse.json({ message: 'Profile already exists.' })
    }

    // Otherwise, create the profile in the db. Some fields in the schema are created with default values.
    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subscriptionActive: false,
        subscriptionTier: null,
        stripeSubscriptionId: null,
      },
    })

    console.log(`Prisma profile created for user: ${clerkUser.id}`)
    return NextResponse.json(
      { message: 'Profile created successfully.' },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error in create-profile API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error.' },
      { status: 500 }
    )
  }
}
