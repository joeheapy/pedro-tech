'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export default function AccountDeletedPage() {
  const { isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    // Only remove the flag when user is confirmed signed out
    if (isLoaded && !isSignedIn && typeof window !== 'undefined') {
      localStorage.removeItem('accountBeingDeleted')
    }
  }, [isLoaded, isSignedIn])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-card shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Account Deleted
        </h1>
        <p className="text-foreground mb-6">
          Your account has been successfully deleted. Thank you for using our
          service.
        </p>
        <Link
          href="/"
          className="text-x font-semibold block w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-emerald-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
