'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useUser, SignedIn, SignedOut, SignOutButton } from '@clerk/nextjs'
import { ThemeToggle } from './theme/ThemeToggle'
import { BookOpenText, Menu, X } from 'lucide-react'
import { useSubscription } from '@/app/hooks/useSubscription'
import { useState, useEffect } from 'react'

export default function NavBar() {
  const { isLoaded, user } = useUser()
  const { isSubscribed, isLoading } = useSubscription()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close mobile menu when window resizes to larger breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMenuOpen])

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
            className="h-8 w-8 md:h-12 md:w-12 text-primary hover:text-primary/90 transition-colors"
            aria-label="Home"
          />
        </Link>

        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6 items-center">
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

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[61px] bg-background z-40 p-4">
          <div className="flex flex-col space-y-6 items-center pt-8">
            <SignedIn>
              {/* Mobile Profile Info */}
              <div className="flex flex-col items-center mb-6">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="Profile Picture"
                    width={60}
                    height={60}
                    className="rounded-full mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-full mb-2"></div>
                )}
                <span className="text-foreground font-medium">
                  {user?.emailAddresses?.[0]?.emailAddress || null}
                </span>
              </div>

              {/* Only show Service Story Maker link if NOT subscribed */}
              {!isLoading && !isSubscribed && (
                <Link
                  href="/servicestorymaker"
                  className="text-foreground hover:text-primary font-medium text-lg py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Service Story Maker
                </Link>
              )}

              <Link
                href="/projects"
                className="text-foreground hover:text-primary font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>

              {/* Only show pricing link if NOT subscribed */}
              {!isLoading && !isSubscribed && (
                <Link
                  href="/subscribe"
                  className="text-foreground hover:text-primary font-medium text-lg py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
              )}

              <Link
                href="/profile"
                className="text-foreground hover:text-primary font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>

              <div className="py-2">
                <ThemeToggle />
              </div>

              {/* Sign Out Button */}
              <SignOutButton>
                <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover-primary font-semibold w-full">
                  Sign Out
                </button>
              </SignOutButton>
            </SignedIn>

            <SignedOut>
              <Link
                href="/"
                className="text-foreground hover:text-primary font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/sign-up"
                className="text-foreground hover:text-primary font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="py-2">
                <ThemeToggle />
              </div>
              <Link
                href="/sign-up"
                className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-md hover-primary font-semibold w-full text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  )
}
