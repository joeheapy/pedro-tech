'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function checkSubscription() {
      if (!userId) {
        setIsSubscribed(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/check-subscription?userId=${userId}`)

        if (!response.ok) {
          console.error('Subscription check failed')
          setIsSubscribed(false)
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setIsSubscribed(data.subscriptionActive)
      } catch (error) {
        console.error('Error checking subscription:', error)
        setIsSubscribed(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [userId])

  // Function to redirect to subscribe page
  const redirectToSubscribe = () => {
    router.push('/subscribe?error=subscription-required')
  }

  return { isSubscribed, isLoading, redirectToSubscribe }
}
