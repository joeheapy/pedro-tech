'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useUser, SignedIn, SignedOut, SignOutButton } from '@clerk/nextjs'
import { ThemeToggle } from './theme/ThemeToggle'
import { BookOpenText } from 'lucide-react'
import { useSubscription } from '@/app/hooks/useSubscription'
// import { useState, useEffect } from 'react'

export default function NavBar() {
  const { isLoaded, user } = useUser()
  const { isSubscribed, isLoading } = useSubscription()

  if (!isLoaded) {
    // Optionally, return a loading indicator or skeleton here
    return null
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-background backdrop-blur-none z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center">
          <BookOpenText
            className="h-12 w-12 text-primary hover:text-primary/90 transition-colors"
            aria-label="Home"
          />
        </Link>

        {/* Navigation Links */}
        <div className="space-x-6 flex items-center">
          <SignedIn>
            {/* Only show Service Story Maker link if NOT subscribed */}
            {!isLoading && !isSubscribed && (
              <Link
                href="/servicestorymaker"
                className="text-foreground hover:text-primary font-medium"
              >
                Service Story Maker
              </Link>
            )}

            <Link
              href="/projects"
              className="text-foreground hover:text-primary font-medium"
            >
              Projects
            </Link>

            {/* Only show pricing link if NOT subscribed */}
            {!isLoading && !isSubscribed && (
              <Link
                href="/subscribe"
                className="text-foreground hover:text-primary font-medium"
              >
                Pricing
              </Link>
            )}
            <ThemeToggle />
            {/* Profile Picture */}
            {user?.imageUrl ? (
              <Link
                href="/profile"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <Image
                  src={user.imageUrl}
                  alt="Profile Picture"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </Link>
            ) : (
              <div className="w-10 h-10 bg-muted rounded-full"></div>
            )}

            {/* Sign Out Button */}
            <SignOutButton>
              <button className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover-primary font-semibold">
                Sign Out
              </button>
            </SignOutButton>
          </SignedIn>

          <SignedOut>
            <Link
              href="/"
              className="text-foreground hover:text-primary font-medium"
            >
              Home
            </Link>
            <Link
              href="/sign-up"
              className="text-foreground hover:text-primary font-medium"
            >
              Pricing
            </Link>
            <ThemeToggle />
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-primary font-semibold"
            >
              Sign in
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  )
}
