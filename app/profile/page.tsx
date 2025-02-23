// app/profile/page.tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { availablePlans } from '@/app/lib/plans' // Adjust the path based on your project structure
import Image from 'next/image'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast' // Import toast
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/spinner'

interface Subscription {
  subscriptionTier: string
  subscriptionActive: boolean // Changed from subscription_active
  stripeSubscriptionId: string | null
}

interface SubscriptionResponse {
  subscription: Subscription | null
  error?: string
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const queryClient = useQueryClient()
  const router = useRouter()

  // State to manage selected priceId
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  // Fetch Subscription Details
  const {
    data: subscription,
    isLoading,
    isError,
    error,
  } = useQuery<SubscriptionResponse>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/profile/subscription-status')
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch subscription.')
      }
      return res.json()
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Adjusted Matching Logic Using priceId
  const currentPlan = (() => {
    console.log('Subscription data:', subscription?.subscription)
    console.log('Available plans:', availablePlans)

    // Early return if no subscription data
    if (!subscription?.subscription) {
      console.log('No subscription data')
      return null
    }

    // Now TypeScript knows subscription.subscription is not null
    const { subscriptionTier } = subscription.subscription

    if (!subscriptionTier) {
      console.log('No subscription tier found')
      return null
    }

    const plan = availablePlans.find((plan) => {
      console.log(
        'Comparing:',
        plan.interval,
        'with:',
        subscriptionTier // Using destructured value
      )
      return plan.interval === subscriptionTier
    })

    console.log('Found plan:', plan)
    return plan
  })()

  // Mutation: Change Subscription Plan
  const changePlanMutation = useMutation<
    unknown, // Replace with actual response type if available
    Error,
    string // The newPriceId
  >({
    mutationFn: async (newPlan: string) => {
      const res = await fetch('/api/profile/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPlan }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          errorData.error || 'Failed to change subscription plan.'
        )
      }
      return res.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Subscription plan updated successfully.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Mutation: Unsubscribe
  const unsubscribeMutation = useMutation<
    unknown, // Replace with actual response type if available
    Error,
    void
  >({
    mutationFn: async () => {
      const res = await fetch('/api/profile/unsubscribe', {
        method: 'POST',
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to unsubscribe.')
      }
      return res.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      router.push('/subscribe')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Handler for confirming plan change
  const handleConfirmChangePlan = () => {
    if (selectedPlan) {
      changePlanMutation.mutate(selectedPlan)
      setSelectedPlan('')
    }
  }

  // Handle Change Plan Selection with Confirmation
  const handleChangePlan = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedPlan = e.target.value
    if (newSelectedPlan) {
      setSelectedPlan(newSelectedPlan)
    }
  }

  // Handle Unsubscribe Button Click
  const handleUnsubscribe = () => {
    if (
      confirm(
        'Are you sure you want to unsubscribe? You will lose access to premium features.'
      )
    ) {
      unsubscribeMutation.mutate()
    }
  }

  // Loading or Not Signed In States
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-100">
        <Spinner />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-100">
        <p>Please sign in to view your profile.</p>
      </div>
    )
  }

  // Main Profile Page UI
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toaster position="top-center" />{' '}
      {/* Optional: For toast notifications */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Panel: Profile Information */}
          <div className="w-full md:w-1/3 p-6 bg-emerald-500 text-white flex flex-col items-center">
            <Image
              src={user.imageUrl || '/default-avatar.png'} // Provide a default avatar if none
              alt="User Avatar"
              width={100}
              height={100}
              className="rounded-full mb-4"
            />
            <h1 className="text-2xl font-bold mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mb-4">{user.primaryEmailAddress?.emailAddress}</p>
            {/* Add more profile details or edit options as needed */}
          </div>

          {/* Right Panel: Subscription Details */}
          <div className="w-full md:w-2/3 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-emerald-700">
              Subscription Details
            </h2>

            {isLoading ? (
              <div className="flex items-center">
                <Spinner />
                <span className="ml-2">Loading subscription details...</span>
              </div>
            ) : isError ? (
              <p className="text-red-500">{error?.message}</p>
            ) : subscription ? (
              <div className="space-y-6">
                {/* Current Subscription Info */}
                <div className="bg-white shadow-md rounded-lg p-4 border border-emerald-200">
                  <h3 className="text-xl font-semibold mb-2 text-emerald-600">
                    Current Plan
                  </h3>
                  {subscription?.subscription ? (
                    <>
                      <p className="text-background mb-2">
                        <strong>Plan:</strong>{' '}
                        {currentPlan?.name ||
                          subscription.subscription.subscriptionTier}
                      </p>
                      <p className="text-background mb-2">
                        <strong>Amount:</strong>{' '}
                        {currentPlan ? `$${currentPlan.amount}` : 'N/A'}
                      </p>
                      <p className="text-background mb-2">
                        <strong>Status:</strong>{' '}
                        <span
                          className={
                            subscription.subscription.subscriptionActive
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }
                        >
                          {subscription.subscription.subscriptionActive
                            ? 'ACTIVE'
                            : 'INACTIVE'}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      No subscription found.
                    </p>
                  )}
                </div>

                {/* Change Subscription Plan */}
                <div className="bg-white shadow-md rounded-lg p-4 border border-emerald-200">
                  <h3 className="text-xl font-semibold mb-2 text-emerald-600">
                    Change Subscription Plan
                  </h3>
                  <select
                    onChange={handleChangePlan}
                    defaultValue={currentPlan?.interval}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    disabled={changePlanMutation.isPending}
                  >
                    <option value="" disabled>
                      Select a new plan
                    </option>
                    {availablePlans.map((plan, key) => (
                      <option key={key} value={plan.interval}>
                        {plan.name} - ${plan.amount} / {plan.interval}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleConfirmChangePlan}
                    className="mt-3 p-2 bg-emerald-500 rounded-lg text-white"
                  >
                    Save Change
                  </button>
                  {changePlanMutation.isPending && (
                    <div className="flex items-center mt-2">
                      <Spinner />
                      <span className="ml-2">Updating plan...</span>
                    </div>
                  )}
                </div>

                {/* Unsubscribe */}
                <div className="bg-white shadow-md rounded-lg p-4 border border-emerald-200">
                  <h3 className="text-xl font-semibold mb-2 text-emerald-600">
                    Unsubscribe
                  </h3>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={unsubscribeMutation.isPending}
                    className={`w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors ${
                      unsubscribeMutation.isPending
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {unsubscribeMutation.isPending
                      ? 'Unsubscribing...'
                      : 'Unsubscribe'}
                  </button>
                </div>
              </div>
            ) : (
              <p>You are not subscribed to any plan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
