// app/profile/page.tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { availablePlans } from '@/app/lib/plans' // Adjust the path based on your project structure
import Image from 'next/image'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast' // Import toast
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/Spinner'

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

  // Mutation: Delete Account
  const deleteAccountMutation = useMutation<unknown, Error, void>({
    mutationFn: async () => {
      const res = await fetch('/api/profile/delete-account', {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete account.')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Your account has been deleted successfully.')
      // Sign out and redirect after a brief delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
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

  // Handle Delete Account Button Click
  const handleDeleteAccount = () => {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      deleteAccountMutation.mutate()
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
    <div className="min-h-screen flex items-start justify-center p-8 sm:pt-16 lg:pt-24">
      <Toaster position="top-center" />
      <div className="w-full max-w-5xl bg-background shadow-md rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Panel: Profile Information */}
          <div className="w-full md:w-1/3 p-6 flex flex-col items-center border-r border-border">
            <Image
              src={user.imageUrl || '/default-avatar.png'}
              alt="User Avatar"
              width={100}
              height={100}
              className="rounded-full mb-4"
            />
            <h1 className="text-2xl font-bold mb-2 text-foreground">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mb-4 text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          {/* Right Panel: Subscription Details */}
          <div className="w-full md:w-2/3 p-6">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Subscription details
            </h2>

            {isLoading ? (
              <div className="flex items-center text-muted-foreground">
                <Spinner />
                <span className="ml-2">Loading subscription details...</span>
              </div>
            ) : isError ? (
              <p className="text-destructive">{error?.message}</p>
            ) : subscription ? (
              <div className="space-y-6">
                {/* Current Subscription Info */}
                <div className="bg-card shadow-sm rounded-lg p-4 border border-border">
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    Current plan
                  </h3>

                  {/* Add separator here */}
                  <hr className="h-px my-2 mb-6 bg-background" />

                  {subscription?.subscription ? (
                    <>
                      <p className="text-foreground mb-2">
                        <strong>Plan:</strong>{' '}
                        {currentPlan?.name ||
                          subscription.subscription.subscriptionTier}
                      </p>
                      <p className="text-foreground mb-2">
                        <strong>Amount:</strong>{' '}
                        {currentPlan ? `$${currentPlan.amount}` : 'N/A'}
                      </p>
                      <p className="text-foreground font-bold mb-2">
                        <strong>Status:</strong>{' '}
                        <span
                          className={
                            subscription.subscription.subscriptionActive
                              ? 'text-primary'
                              : 'text-destructive'
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
                <div className="bg-card shadow-sm rounded-lg p-4 border border-border">
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    Change subscription plan
                  </h3>
                  <hr className="h-px my-2 mb-6 bg-background" />
                  <select
                    onChange={handleChangePlan}
                    defaultValue={currentPlan?.interval}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full mt-6 p-2 bg-primary mb-6 text-lg font-semibold text-primary-foreground rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Save Change
                  </button>
                </div>

                {/* Unsubscribe */}
                <div className="bg-card shadow-sm rounded-lg p-4 border border-border">
                  <h3 className="text-xl font-semibold mb-2 text-cyan-600">
                    Cancel subscription
                  </h3>
                  <hr className="h-px my-2 mb-6 bg-background" />
                  <p className="text-foreground mb-6">
                    If you cancel your subscription, it will remain active until
                    the end of your current billing period. After that, it won’t
                    renew and no further payments will be taken. You’ll still
                    have access to all features and your projects until your
                    subscription expires.
                  </p>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={unsubscribeMutation.isPending}
                    className={`w-full text-lg font-semibold bg-cyan-600 text-destructive-foreground py-2 px-4 rounded-md hover:bg-cyan-800 transition-colors ${
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

                {/* Add this after the Unsubscribe card */}
                <div className="bg-card shadow-sm rounded-lg p-4 border border-border">
                  <h3 className="text-xl font-semibold mb-2 text-destructive">
                    Delete account
                  </h3>
                  <hr className="h-px my-2 mb-6 bg-background" />
                  <p className="text-foreground mb-6">
                    If you choose to delete your account, please note that all
                    your projects will be permanently deleted and cannot be
                    recovered. No further payments will be taken after deletion.
                    Please be aware that any payments already made are
                    non-refundable, either in full or in part.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                    className={`w-full text-lg font-semibold bg-destructive text-destructive-foreground py-2 px-4 rounded-md hover:bg-red-800 transition-colors ${
                      deleteAccountMutation.isPending
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {deleteAccountMutation.isPending
                      ? 'Deleting Account...'
                      : 'Delete Account'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                You are not subscribed to any plan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
