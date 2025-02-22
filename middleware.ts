// app/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 1. Define your "public" routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-up(.*)',
  '/subscribe(.*)',
  '/api/create-profile',
  '/api/checkout(.*)',
  '/api/webhook(.*)',
  '/api/check-subscription(.*)',
])

// 2. Define a route group for Meal Plan. We want to check subscription
const isMealPlanRoute = createRouteMatcher(['/mealplan(.*)'])

// 3. Define a route group for Profile Routes (Protected but may not require subscription)
const isProfileRoute = createRouteMatcher(['/profile(.*)'])

const isSignUpRoute = createRouteMatcher(['/sign-up(.*)'])

// Clerk's middleware
export default clerkMiddleware(async (auth, req) => {
  const userAuth = await auth()
  const { userId } = userAuth
  const { pathname, origin } = req.nextUrl

  console.log('Middleware check:', pathname, isPublicRoute(req), userId)

  // If it's the check-subscription route, skip logic to avoid loops
  if (pathname === '/api/check-subscription') {
    return NextResponse.next()
  }

  // If route is NOT public & user not signed in → redirect to /sign-up
  if (!isPublicRoute(req) && !userId) {
    return NextResponse.redirect(new URL('/sign-up', origin))
  }

  // Add this new condition to handle root path redirects
  if ((pathname === '/' || isSignUpRoute(req)) && userId) {
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
        if (data.subscriptionActive) {
          console.log('Redirecting to mealplan - active subscription')
          return NextResponse.redirect(new URL('/mealplan', origin))
        }
        return NextResponse.redirect(new URL('/subscribe', origin))
      }
    } catch (error) {
      console.error('Subscription check failed:', error)
      return NextResponse.redirect(new URL('/subscribe', origin))
    }
  }

  // For mealplan routes, only check if they're allowed to access
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
        return NextResponse.redirect(new URL('/subscribe', origin))
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      return NextResponse.redirect(new URL('/subscribe', origin))
    }
  }

  // Allow all other requests
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
