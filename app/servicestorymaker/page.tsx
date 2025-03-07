'use client'

import { useState, JSX } from 'react'
import { JourneyContainer } from '@/components/journeySteps/JourneyContainer'
import { CustomerPainsContainer } from '@/components/customerPains/CustomerPainsContainer'
import { BusinessPainsContainer } from '@/components/businessPains/BusinessPainsContainer'
import { PersonasContainer } from '@/components/personas/PersonasContainer'
import { FeaturesContainer } from '@/components/features/FeaturesContainer'
import { EnablersContainer } from '@/components/enablers/EnablersContainer'
import { TokenControls } from '@/components/ui/tokenControls'
import { useSubscription } from '@/app/hooks/useSubscription'
import {
  JourneyStep,
  CustomerPainPointData,
  BusinessPainPointData,
  PersonaData,
  TARIFFS,
} from '@/app/lib/types'
import { useTokens } from '@/app/utils/useTokens'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServiceStoryMakerDashboard(): JSX.Element {
  const { Tokens, deductTokens, resetTokens } = useTokens()
  const { isSubscribed, isLoading, redirectToSubscribe } = useSubscription()
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([])
  const [customerPains, setCustomerPains] = useState<CustomerPainPointData[]>(
    []
  )
  const [businessPains, setBusinessPains] = useState<BusinessPainPointData[]>(
    []
  )
  const [personaData, setPersonaData] = useState<PersonaData[]>([])

  const handleJourneyGenerated = (steps: JourneyStep[]): void => {
    try {
      deductTokens(TARIFFS.journeySteps)
      setJourneySteps(steps)
    } catch (error) {
      console.error('Failed to generate journey:', error)
    }
  }

  const handleCustomerPainPointsGenerated = (
    pains: CustomerPainPointData[]
  ): void => {
    try {
      console.log('Received customer pains:', pains)
      setCustomerPains(pains)
      deductTokens(TARIFFS.customerPains)
    } catch (error) {
      console.error('Failed to handle customer pains:', error)
    }
  }

  const handleBusinessPainPointsGenerated = (
    pains: BusinessPainPointData[]
  ): void => {
    try {
      console.log('Received business pains:', pains)
      setBusinessPains(pains)
      deductTokens(TARIFFS.businessPains)
    } catch (error) {
      console.error('Failed to handle business pains:', error)
    }
  }

  const handlePersonasGenerated = (personas: PersonaData[]): void => {
    try {
      setPersonaData(personas) // Store personas in state
      deductTokens(TARIFFS.personas)
    } catch (error) {
      console.error('Failed to handle personas:', error)
    }
  }

  const handleFeaturesGenerated = (tariff: number): void => {
    try {
      deductTokens(tariff)
    } catch (error) {
      console.error('Failed to deduct Tokens:', error)
    }
  }

  const handleEnablersGenerated = (tariff: number): void => {
    try {
      deductTokens(tariff)
    } catch (error) {
      console.error('Failed to deduct Tokens:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }
  // This function renders an empty card for each placeholder card.
  const renderPlaceholderCards = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <div
        key={`placeholder-${index}`}
        className="rounded-lg border-dashed border-8 muted-foreground h-[188px] w-full mb-8"
      />
    ))
  }

  return (
    <>
      <TokenControls
        Tokens={Tokens.balance}
        error={Tokens.error}
        onReset={resetTokens}
      />
      <main className="min-h-screen">
        <div className="container mx-auto space-y-8 py-8">
          {/* Journey container is accessible to everyone */}
          <JourneyContainer
            journeySteps={journeySteps}
            onJourneyGenerated={handleJourneyGenerated}
          />

          {/* Protected components */}
          {isSubscribed ? (
            <>
              <PersonasContainer
                journeySteps={journeySteps}
                onPersonasGenerated={handlePersonasGenerated}
              />
              <CustomerPainsContainer
                journeySteps={journeySteps}
                onCustomerPainPointsGenerated={
                  handleCustomerPainPointsGenerated
                }
              />
              <BusinessPainsContainer
                journeySteps={journeySteps}
                onBusinessPainPointsGenerated={
                  handleBusinessPainPointsGenerated
                }
              />
              <FeaturesContainer
                journeySteps={journeySteps}
                customerPains={customerPains}
                businessPains={businessPains}
                personaData={personaData}
                onFeaturesGenerated={() =>
                  handleFeaturesGenerated(TARIFFS.features)
                }
              />
              <EnablersContainer
                journeySteps={journeySteps}
                customerPains={customerPains}
                businessPains={businessPains}
                personaData={personaData}
                onEnablersGenerated={() =>
                  handleEnablersGenerated(TARIFFS.features)
                }
              />
            </>
          ) : (
            <div>
              <div className="bg-card rounded-lg border-2 border-primary p-8 shadow-sm my-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Upgrade your access
                </h2>
                <p className="text-foreground mb-6">
                  Generate your service journey for free above. To access
                  advanced features like personas, customer and business pain
                  point generation, and service feature generation, you will
                  need to subscribe to a paid plan.
                </p>
                <Button onClick={redirectToSubscribe} className="px-6">
                  Subscribe Now
                </Button>
              </div>
              {renderPlaceholderCards(5)}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
