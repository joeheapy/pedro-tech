'use client'

import Link from 'next/link'

// Lucide React icons
import { Sparkles, Map, UserSquare2, Lightbulb, Compass } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="px-4 py-2 sm:py-4 lg:py-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="rounded-lg sm:mt-1 md:mt-6 mb-10 p-6 text-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight">
              A simple tool for people-centred service design with AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-foreground/80">
              Streamline your service design process with AI-generated journeys,
              personas, and service feature recommendations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/servicestorymaker"
                className="inline-block text-lg md:text-xl px-6 py-4 bg-primary text-primary-foreground rounded-md hover:bg-[var(--primary-hover)] transition-colors font-semibold shadow-md"
              >
                Get Started
              </Link>
              <Link
                href="#how-it-works"
                className="inline-block text-lg md:text-xl px-6 py-4 border-2 border-primary text-primary rounded-md hover:bg-primary/10 transition-colors font-medium"
              >
                See How It Works
              </Link>
            </div>
          </div>
          <div className="hidden md:block order-1 lg:order-2 justify-center">
            <div className="relative w-full max-w-lg h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-2xl">
              <div
                className="absolute inset-0 border-4 border-dashed border-black rounded-lg flex items-center justify-center bg-transparent"
                aria-label="Service Design Dashboard"
              >
                <div className="text-center p-4">
                  <p className="text-foreground/70 text-lg">
                    This will eventually be an image.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="mb-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 max-w-6xl mx-auto">
          <div className="flex flex-col items-start p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary/10 rounded-lg mb-4">
              <Map className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Customer Journey Mapping
            </h3>
            <p className="text-muted-foreground">
              Start service design by generating a simple customer journey.
            </p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary/10 rounded-lg mb-4">
              <UserSquare2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Persona Generation
            </h3>
            <p className="text-muted-foreground">
              Develop realistic user personas based on journey context.
            </p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary/10 rounded-lg mb-4">
              <Compass className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Pain Point Analysis
            </h3>
            <p className="text-muted-foreground">
              Identify customer and business pain points throughout the journey.
            </p>
          </div>

          <div className="flex flex-col items-start p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary/10 rounded-lg mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Feature Recommendations
            </h3>
            <p className="text-muted-foreground">
              Receive AI-powered feature suggestions to address user needs.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="container mx-auto mb-24 px-4 scroll-mt-24"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your service design process
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-md">
              <Map className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              Map Your Journey
            </h3>
            <p className="text-center text-xl text-muted-foreground max-w-sm">
              Create customer journeys with AI assistance to visualize the
              complete service experience.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-md">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              Identify Pain Points
            </h3>
            <p className="text-center text-xl text-muted-foreground">
              Discover customer and business pain points throughout the journey
              with AI analysis.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-md">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">
              Generate Solutions
            </h3>
            <p className="text-center text-xl text-muted-foreground">
              Get AI-powered feature recommendations to address the identified
              pain points.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-12 bg-muted/30 rounded-2xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Service Designers
          </h2>
          <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
            Hear from professionals already using our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <span className="text-primary font-bold">CM</span>
              </div>
              <div>
                <h4 className="font-semibold">
                  Claire Morgan (Made-up person)
                </h4>
                <p className="text-muted-foreground text-sm">
                  Service Designer, Community Housing Trust
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Service Story Maker transformed how we design our housing support
              services. The AI-generated journeys and personas saved us weeks of
              work.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <span className="text-primary font-bold">JL</span>
              </div>
              <div>
                <h4 className="font-semibold">James Lee (Made-up person)</h4>
                <p className="text-muted-foreground text-sm">
                  UX Lead, Youth Opportunity Alliance
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">
              The pain point analysis helped us identify gaps in our youths
              services that we had not recognized. Now our programs are better
              aligned with what young people actually need.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <span className="text-primary font-bold">SD</span>
              </div>
              <div>
                <h4 className="font-semibold">Sarah Devi (Made-up person)</h4>
                <p className="text-muted-foreground text-sm">
                  Product Manager, Community Health Initiative
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">
              With limited resources, we were struggling to properly design our
              services. Service Story Maker made the process manageable and
              helped us create health programs that truly work for our
              community.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-24 px-8 py-16 bg-primary/5 rounded-3xl text-center max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Ready to Transform Your Service Design?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join professionals who are creating more effective, user-centered
          services with our AI-powered platform.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/servicestorymaker"
            className="inline-block text-lg px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-[var(--primary-hover)] transition-colors font-semibold shadow-md"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}
