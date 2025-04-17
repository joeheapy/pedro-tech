'use client'

import { useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { availablePlans } from '@/app/lib/plans'
import { notify, GlobalToaster } from '@/components/ui/toast-config'

// Define response types
type SubscribeResponse = {
  url: string
}

type SubscribeError = {
  error: string
}

// Separate component for handling search params
function ErrorHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)

      if (error === 'subscription-required') {
        // Use our custom notify.info function
        notify.info(
          'This feature requires an active subscription. Choose a plan to continue.'
        )
      } else if (error === 'subscription-check-failed') {
        // Use our custom notify.warning function
        notify.warning(
          "We couldn't verify your subscription status. Please refresh or contact support if the problem persists."
        )
      }
    }
  }, [searchParams])

  return null // This component doesn't render anything
}

// This function sends a POST request to the /api/checkout route to subscribe the user to a plan
async function subscribeToPlan(
  planType: string,
  userId: string,
  email: string
): Promise<SubscribeResponse> {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planType,
      userId,
      email,
    }),
  })

  if (!response.ok) {
    const errorData: SubscribeError = await response.json()
    throw new Error(errorData.error || 'Something went wrong.')
  }
  const data: SubscribeResponse = await response.json()
  return data
}

// This component renders the pricing page with subscription plans
export default function Subscribe() {
  const { user } = useUser()
  const router = useRouter()
  const userId = user?.id
  const email = user?.emailAddresses[0].emailAddress || ''

  const { mutate, isPending } = useMutation<
    SubscribeResponse,
    Error,
    { planType: string }
  >({
    mutationFn: async ({ planType }) => {
      if (!userId) {
        throw new Error('User not signed in.')
      }

      return subscribeToPlan(planType, userId, email)
    },

    onMutate: () => {
      notify.loading('Heading to checkout...')
    },

    onSuccess: (data) => {
      window.location.href = data.url
      // notify.success('Heading to checkout...')
    },

    onError: (error) => {
      console.log(error)
      notify.error('Something went wrong. Please try again.')
    },
  })

  // Handler for subscribing to a plan
  const handleSubscribe = (planType: string) => {
    if (!userId) {
      // Redirect to sign-up if the user is not signed in
      router.push('/sign-up')
      return
    }

    // Trigger the mutation
    mutate({ planType })
  }

  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 ">
      <GlobalToaster />

      {/* Wrap the search params component in Suspense */}
      <Suspense fallback={null}>
        <ErrorHandler />
      </Suspense>

      {/* Section Header */}
      <div>
        <h2 className="text-3xl font-bold text-center mt-2 sm:text-5xl tracking-tight text-foreground">
          Pricing
        </h2>
      </div>

      {/* Cards Container */}
      <div className="mt-16 container mx-auto space-y-12 sm:grid-cols-1 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
        {availablePlans.map((plan, key) => (
          <div
            key={key}
            className="
            relative p-8
            border border-border rounded-2xl shadow-sm 
            flex flex-col
            hover:shadow-md hover:scale-[1.02] 
            transition-transform duration-200 ease-out
            bg-card text-card-foreground
          "
          >
            <div className="flex-1">
              {plan.isPopular && (
                <p className="absolute top-0 py-1.5 px-4 bg-primary text-primary-foreground rounded-full text-xs font-semibold uppercase tracking-wide transform -translate-y-1/2">
                  Most popular
                </p>
              )}
              <h3 className="text-xl font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="mt-4 flex items-baseline text-foreground">
                <span className="text-5xl font-extrabold tracking-tight">
                  ${plan.amount}
                </span>
                <span className="ml-1 text-xl font-semibold text-muted-foreground">
                  /{plan.interval}
                </span>
              </p>
              <p className="mt-6 text-muted-foreground">{plan.description}</p>
              <ul role="list" className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0 w-6 h-6 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="ml-3 text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`${
                plan.interval === 'month'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
              } mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium
            disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed`}
              onClick={() => handleSubscribe(plan.interval)}
              disabled={isPending}
            >
              {isPending ? 'Please wait...' : `Subscribe ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
