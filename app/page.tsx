// app/page.tsx (HomePage)
'use client'

// import { useState } from 'react'
// import { SignIn, SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="px-4 py-10 sm:py-12 lg:py-16 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="rounded-lg sm:mt-4 md:mt-10 mb-12 p-8 text-center">
        <h1 className="text-7xl font-bold mb-6 text-foreground">
          Write your service story
        </h1>
        <p className="text-2xl mb-12 text-foreground/80">
          A simple tool for people-centred service design with AI.
        </p>
        <Link
          href="/mealplan"
          className="inline-block text-2xl px-6 py-4 bg-primary text-primary-foreground rounded-md hover-primary font-semibold"
        >
          Get Started
        </Link>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto mb-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-foreground">
            How it works
          </h2>
          <p className="mt-2 text-xl text-muted-foreground">
            Follow these simple steps to get your personalized meal plan
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              {/* Icon for Step 1 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14v7m-3-3h6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              Create an Account
            </h3>
            <p className="text-center text-xl text-muted-foreground max-w-sm">
              Sign up or sign in to access your personalized meal plans.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              {/* Icon for Step 2 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              Set Your Preferences
            </h3>
            <p className="text-center text-xl text-muted-foreground">
              Input your dietary preferences and goals to tailor your meal
              plans.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              {/* Icon for Step 3 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              Receive Your Meal Plan
            </h3>
            <p className="text-center text-xl text-muted-foreground">
              Get your customized meal plan delivered weekly to your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
