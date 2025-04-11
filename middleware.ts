// app/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 1. Define your "public" routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-up(.*)',
  '/sign-in(.*)',
  '/subscribe(.*)',
  // '/servicestorymaker(.*)',
  '/api/checkout(.*)',
  '/api/stripe-webhook(.*)',
  '/api/check-subscription(.*)',
  '/create-profile(.*)',
  '/api/create-profile(.*)',
  '/api/check-profile(.*)',
  '/api/profile/delete-account(.*)',
  '/api/openai/(.*)',
])

// 2. Define routes that require an active subscription
const requiresSubscriptionRoute = createRouteMatcher([
  // '/servicestorymaker(.*)',
  '/profile(.*)',
  '/projects(.*)', // Added profile routes to subscription-protected routes
])

// Sign-up route matcher - used to prevent redirects during sign-up flow
const isSignUpRoute = createRouteMatcher(['/sign-up(.*)'])

// Clerk's middleware
export default clerkMiddleware(async (auth, req) => {
  const userAuth = await auth()
  const { userId } = userAuth
  const { pathname, origin } = req.nextUrl

  console.log('Middleware check:', pathname, isPublicRoute(req), userId)

  // Skip API routes to prevent loops
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // If route is NOT public & user not signed in → redirect to /sign-up
  if (!isPublicRoute(req) && !userId) {
    return NextResponse.redirect(new URL('/sign-up', origin))
  }

  // IMPORTANT: Allow create-profile route to function properly
  if (pathname === '/create-profile' && userId) {
    console.log('Allowing access to create-profile route')
    return NextResponse.next()
  }

  // Don't redirect from sign-up if user is already signed in
  // Let Clerk handle the redirect to create-profile
  if (userId && isSignUpRoute(req)) {
    console.log('User already signed in on sign-up route')
    return NextResponse.next()
  }

  // Don't send subscribed users to the subscribed page
  if (userId && pathname === '/subscribe') {
    try {
      // First check if profile exists
      const profileCheck = await fetch(
        `${origin}/api/check-profile?userId=${userId}`,
        {
          method: 'GET',
          headers: { cookie: req.headers.get('cookie') || '' },
        }
      )

      const profileData = await profileCheck.json()

      // Only proceed if they have a profile
      if (profileData.exists) {
        // Check if user has an active subscription
        const checkSubRes = await fetch(
          `${origin}/api/check-subscription?userId=${userId}`,
          {
            method: 'GET',
            headers: { cookie: req.headers.get('cookie') || '' },
          }
        )

        if (checkSubRes.ok) {
          const data = await checkSubRes.json()

          // If user already has active subscription, redirect to profile
          if (data.subscriptionActive) {
            console.log('User already subscribed - redirecting to profile')
            return NextResponse.redirect(new URL('/projects', origin))
          }
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      // Continue to subscription page on error
    }
  }

  // Check subscription for routes that require it (servicestorymaker, projects and profile)
  if (userId && requiresSubscriptionRoute(req)) {
    try {
      // First check if profile exists
      const profileCheck = await fetch(
        `${origin}/api/check-profile?userId=${userId}`,
        {
          method: 'GET',
          headers: { cookie: req.headers.get('cookie') || '' },
        }
      )

      const profileData = await profileCheck.json()

      // If no profile exists, redirect to create-profile
      if (!profileData.exists) {
        console.log('No profile found - redirecting to create-profile')
        return NextResponse.redirect(new URL('/create-profile', origin))
      }

      // Then check subscription
      const checkSubRes = await fetch(
        `${origin}/api/check-subscription?userId=${userId}`,
        {
          method: 'GET',
          headers: { cookie: req.headers.get('cookie') || '' },
        }
      )

      if (!checkSubRes.ok) {
        console.log('Subscription check failed')
        return NextResponse.redirect(
          new URL('/subscribe?error=subscription-check-failed', origin)
        )
      }

      const data = await checkSubRes.json()

      if (!data.subscriptionActive) {
        console.log('No active subscription - redirecting to subscribe')
        return NextResponse.redirect(
          new URL('/subscribe?error=subscription-required', origin)
        )
      }
    } catch (error) {
      console.error('Subscription or profile check failed:', error)
      return NextResponse.redirect(
        new URL('/subscribe?error=subscription-check-failed', origin)
      )
    }
  }

  // Handle home page redirect for authenticated users
  if (
    userId &&
    pathname === '/' &&
    !req.headers.get('referer') // Only redirect on direct navigation or external links
  ) {
    try {
      // Check if user has a profile in Prisma
      const profileCheck = await fetch(
        `${origin}/api/check-profile?userId=${userId}`,
        {
          method: 'GET',
          headers: { cookie: req.headers.get('cookie') || '' },
        }
      )

      const profileData = await profileCheck.json()

      // If no profile exists, redirect to create-profile
      if (!profileData.exists) {
        console.log('No profile found - redirecting to create-profile')
        return NextResponse.redirect(new URL('/create-profile', origin))
      }

      // Check if user has an active subscription
      const checkSubRes = await fetch(
        `${origin}/api/check-subscription?userId=${userId}`,
        {
          method: 'GET',
          headers: { cookie: req.headers.get('cookie') || '' },
        }
      )

      if (checkSubRes.ok) {
        const data = await checkSubRes.json()

        // If subscription active, redirect to servicestorymaker
        if (data.subscriptionActive) {
          console.log(
            'Active subscription found - redirecting to servicestorymaker'
          )
          return NextResponse.redirect(new URL('/projects', origin))
        }

        // Otherwise redirect to subscribe page
        return NextResponse.redirect(new URL('/subscribe', origin))
      }
    } catch (error) {
      console.error('Subscription/profile check failed:', error)
    }
  }

  return NextResponse.next()
})

// Next.js route matching config
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
