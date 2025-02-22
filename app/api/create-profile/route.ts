/**
 * Create Profile API Route Handler
 *
 * This API route handles the creation of user profiles after successful Clerk authentication.
 * It ensures each user has a corresponding profile in the database for subscription management.
 *
 * Flow:
 * 1. Verifies user authentication via Clerk
 * 2. Validates user email existence
 * 3. Checks for existing profile to prevent duplicates
 * 4. Creates new profile with default subscription settings
 *
 * Database Schema:
 * - userId: Unique identifier from Clerk
 * - email: User's primary email address
 * - subscriptionActive: Boolean flag for subscription status
 * - subscriptionTier: Current subscription level
 * - stripeSubscriptionId: Associated Stripe subscription ID
 *
 * @route POST /api/create-profile
 * @returns {Object} JSON response with success/error message and appropriate status code
 * - 201: Profile created successfully
 * - 400: Missing email address
 * - 404: User not found in Clerk
 * - 500: Internal server error
 */

prisma
  .$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((e) => console.error('Database connection failed:', e))

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

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
