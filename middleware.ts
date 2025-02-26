// app/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 1. Define your "public" routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-up(.*)',
  '/subscribe(.*)',
  '/api/checkout(.*)',
  '/api/stripe-webhook(.*)',
  '/api/check-subscription(.*)',
  '/create-profile(.*)',
  '/api/create-profile(.*)',
  '/api/openai/(.*)',
])

// 2. Define a route group for Meal Plan. We want to check subscription
const isMealPlanRoute = createRouteMatcher(['/mealplan(.*)'])

// 3. Define a route group for Profile Routes (Protected but may not require subscription)
const isProfileRoute = createRouteMatcher(['/profile(.*)'])

const isSignUpRoute = createRouteMatcher(['/sign-up(.*)'])
// const isSignInRoute = createRouteMatcher(['/sign-in(.*)'])

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

  if (userId && isSignUpRoute(req)) {
    return NextResponse.redirect(new URL('/create-profile', origin))
  }

  if (
    userId &&
    (isSignUpRoute(req) ||
      (pathname === '/' && !req.headers.get('referer')?.includes('/mealplan')))
  ) {
    try {
      console.log('Checking subscription for user:', userId)
      const checkSubRes = await fetch(
        `${origin}/api/check-subscription?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            cookie: req.headers.get('cookie') || '',
          },
        }
      )

      if (checkSubRes.ok) {
        const data = await checkSubRes.json()
        console.log('Subscription check response:', data)

        // If user has active subscription, redirect to mealplan only if not already there
        if (data.subscriptionActive && !isMealPlanRoute(req)) {
          console.log('Active subscription found - redirecting to mealplan')
          return NextResponse.redirect(new URL('/mealplan', origin))
        }
      }
    } catch (error) {
      console.error('Subscription check failed:', error)
    }

    // Only redirect to subscribe if coming from sign-up route
    if (isSignUpRoute(req)) {
      return NextResponse.redirect(new URL('/subscribe', origin))
    }
  }

  // Protect mealplan and profile routes
  if ((isMealPlanRoute(req) || isProfileRoute(req)) && userId) {
    try {
      const checkSubRes = await fetch(
        `${origin}/api/check-subscription?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            cookie: req.headers.get('cookie') || '',
          },
        }
      )

      if (!checkSubRes.ok || !(await checkSubRes.json()).subscriptionActive) {
        // Redirect with a searchParam that can be used to show the toast
        return NextResponse.redirect(
          new URL('/subscribe?error=subscription-required', origin)
        )
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      return NextResponse.redirect(
        new URL('/subscribe?error=subscription-check-failed', origin)
      )
    }
  }

  return NextResponse.next()
})

// 4. Next.js route matching config
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
