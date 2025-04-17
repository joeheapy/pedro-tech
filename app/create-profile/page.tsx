// components/CreateProfileOnSignIn.tsx

'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
// import toast from 'react-hot-toast'

type ApiResponse = {
  message: string
  error?: string
}

async function createProfileRequest() {
  const response = await fetch('/api/create-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()
  return data as ApiResponse
}

export default function CreateProfile() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const { mutate, isPending } = useMutation({
    mutationFn: createProfileRequest,
    onSuccess: () => {
      router.push('/')
    },
    onError: (error) => {
      console.error('Error creating profile:', error)
    },
  })

  useEffect(() => {
    // Check for deletion flag
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem('accountBeingDeleted') === 'true'
    ) {
      // Don't remove flag here - just redirect
      router.push('/account-deleted')
      return
    }

    // Normal profile creation
    if (isLoaded && isSignedIn && !isPending) {
      mutate()
    }
  }, [isLoaded, isSignedIn, isPending, mutate, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-foreground text-lg font-medium">Signing you in...</p>
      </div>
    </div>
  )
}
