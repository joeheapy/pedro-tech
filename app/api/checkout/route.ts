/**
 * Stripe Checkout Session Route Handler
 *
 * This API route creates a Stripe Checkout session for subscription payments.
 * It validates the incoming request data and generates a checkout URL for the user.
 *
 * Flow:
 * 1. Validates required fields (planType, userId, email)
 * 2. Verifies plan type is valid
 * 3. Retrieves Stripe price ID for the selected plan
 * 4. Creates Stripe checkout session with subscription configuration
 * 5. Returns checkout URL or error response
 *
 * Required Environment Variables:
 * - NEXT_PUBLIC_BASE_URL: Base URL of the application
 * - STRIPE_SECRET_KEY: Stripe API secret key
 
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/app/lib/stripe'
import { getPriceIdFromType } from '@/app/lib/plans'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const { planType, userId, email } = await request.json()

    if (!planType || !userId || !email) {
      return NextResponse.json(
        { error: 'Plan type, User ID, and Email are required.' },
        { status: 400 }
      )
    }

    const allowedPlanTypes = ['week', 'month', 'year']
    if (!allowedPlanTypes.includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type.' }, { status: 400 })
    }

    const priceId = getPriceIdFromType(planType)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID for the selected plan not found.' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      mode: 'subscription',
      // Clerk user ID and plan type sent to Strip as metadata
      // so we can get this back from Strip in  stripe-webhook route.
      metadata: { clerkUserId: userId, planType },
      // Success URL is provided by Stripe
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
    })
    // This code returns the session URL for the Stripe Checkout page
    return NextResponse.json({ url: session.url })

    // Modified catch block
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe API Error:', {
        type: error.type,
        message: error.message,
        code: error.code,
      })
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    if (error instanceof Error) {
      console.error('General Error:', error.message)
      return NextResponse.json(
        { error: 'Something went wrong' },
        { status: 500 }
      )
    }

    console.error('Unknown Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
