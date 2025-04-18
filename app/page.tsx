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
        <h1 className="text-7xl font-bold mb-20 text-foreground">
          A simple tool for people-centred service design with AI
        </h1>
        {/* <p className="text-2xl mb-12 text-foreground/80">
          A simple tool for people-centred service design with AI.
        </p> */}
        <Link
          href="/servicestorymaker"
          className="inline-block text-2xl px-6 py-4 bg-primary text-primary-foreground rounded-md hover:primary font-semibold"
        >
          Get Started
        </Link>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto mb-12 px-4">
        <div className="text-center mb-8">
          {/* <h2 className="text-3xl font-semibold text-foreground">
            How it works
          </h2>
          <p className="mt-2 text-xl text-muted-foreground">
            Starting design your service.
          </p> */}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              {/* Icon for Step 1 */}
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              One cool thing
            </h3>
            <p className="text-center text-xl text-muted-foreground max-w-sm">
              This will explain a cool thing.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              {/* Icon for Step 2 */}
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              Another cool thing
            </h3>
            <p className="text-center text-xl text-muted-foreground">
              This will explain another cool thing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
              {/* Icon for Step 3 */}
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              One more cool thing
            </h3>
            <p className="text-center text-xl text-muted-foreground">
              Here is another cool thing.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
