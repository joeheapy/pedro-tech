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
      router.push('/subscribe')
    },
    onError: (error) => {
      console.error('Error creating profile:', error)
    },
  })

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPending) {
      mutate()
    }
  }, [isLoaded, isSignedIn, isPending, mutate])

  return <div> Processing sign-in...</div>
}
