'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { CsvDownloadButton } from './CsvDownloadButton'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'
import {
  FeatureData,
  JourneyStep,
  CustomerPainPointData,
  BusinessPainPointData,
  NUMBER_OF_FEATURES,
  TARIFFS,
  PersonaData,
} from '@/app/lib/types'

interface FeaturesContainerProps {
  journeySteps: JourneyStep[]
  customerPains: CustomerPainPointData[]
  businessPains: BusinessPainPointData[]
  personaData: PersonaData[]
  onFeaturesGenerated: () => void
}

export function FeaturesContainer({
  journeySteps = [],
  customerPains = [],
  businessPains = [],
  personaData = [],
  onFeaturesGenerated,
}: FeaturesContainerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featureData, setFeatureData] = useState<FeatureData[]>([])

  const hasJourney = journeySteps.length > 0
  const hasCustomerPains = customerPains && customerPains.length > 0
  const isDisabled = !hasJourney || !hasCustomerPains

  const getStatusMessage = () => {
    if (!hasJourney) return 'Create a service story first.'
    if (!hasCustomerPains) return 'Generate customer pain points first.'
    return `Brainstorm ${NUMBER_OF_FEATURES} service feature ideas to get you started.`
  }

  const handleGenerateFeatures = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/openai/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formattedPrompt: createPrompt() }),
      })
      const { data, error } = await response.json()
      if (error) throw new Error(error)
      setFeatureData(data)
      onFeaturesGenerated()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate features'
      )
    } finally {
      setLoading(false)
    }
  }

  const createPrompt = () => {
    console.log('Pain Points Arrays:', {
      customerPainsLength: customerPains?.length,
      customerPainsData: customerPains,
      businessPainsLength: businessPains?.length,
      businessPainsData: businessPains,
    })

    if (!journeySteps?.length) {
      return `You are a customer experience expert. Please generate ${NUMBER_OF_FEATURES} customer features for a company.`
    }

    // Format journey steps data
    const stepsText = journeySteps
      .map(
        (step) =>
          `Step ${step.step}: ${step.title}\nDescription: ${step.description}`
      )
      .join('\n\n')

    // Extract customer scenarios from personas.
    const personaScenarioText =
      personaData?.length > 0
        ? personaData
            .map((persona, index) => {
              if (!persona.personaScenario) return null
              return `Persona ${index + 1} Scenario:\n${
                persona.personaScenario
              }`
            })
            .filter(Boolean)
            .join('\n\n')
        : 'No persona scenarios provided'

    console.log('Persona Scenarios:', personaScenarioText)

    // Format customer pains with improved validation
    const customerPainsText =
      customerPains?.length > 0
        ? customerPains
            .map((pain, index) => {
              console.log(`Processing customer pain ${index}:`, pain)
              if (
                !pain ||
                (!pain['customer-pain-1'] && !pain['customer-pain-2'])
              ) {
                return null
              }
              const points = [
                pain['customer-pain-1'],
                pain['customer-pain-2'],
              ].filter((point) => point?.trim().length > 0)

              return points.length > 0
                ? `${index + 1}. ${points.join(', ')}`
                : null
            })
            .filter(Boolean)
            .join('\n')
        : 'No customer pain points provided'

    const prompt = `You are a marketing director and an expert in the design of excellent customer experiences. 
    Here is the customer journey:
    ${stepsText}
    Read this list of problems that customers want the service to solve:
    ${customerPainsText}
    IMPORTANT INSTRUCTIONS:
    1. Imagine exactly ${NUMBER_OF_FEATURES} innovative product and service features that are creative responses to the customer pain points provided.
    2. Write a one-line description ONLY.
    3. MAXIMUM of 15 words per feature idea.
    4. Return a list of feature ideas.
    5. No titles.
    6. No numbering.
    VERIFY BEFORE RESPONDING:
    - Have you provided exactly ${NUMBER_OF_FEATURES} feature ideas?
    - They are the best ideas you can think of.
    - Are they all one line only?
    - Are they all under 15 words?
    - Return all titles in sentance case.`

    return prompt
  }

  return (
    <div className="w-full space-y-8">
      {/* Form Section (Previously FeatureForm) */}
      <Card
        className={`w-full p-6 ${
          isDisabled ? 'bg-muted' : 'gradient-pink-dark'
        } border-none`}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Service Features
              </h2>
              <p className="text-base text-muted-foreground">
                {getStatusMessage()}
              </p>
            </div>
            <div>
              <TariffRoundel cost={TARIFFS.features} variant="small" />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleGenerateFeatures}
            disabled={loading || isDisabled}
            className={`bg-foreground dark:text-background hover:opacity-70 transition-opacity ${
              isDisabled ? 'opacity-60' : ''
            }`}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving you time...' : 'Brainstorm Features'}
          </Button>
        </div>
      </Card>

      {/* Display Section (Previously FeatureDisplay) */}
      {error && (
        <Card className="bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {featureData.length > 0 && (
        <div className="w-full flex flex-col items-center space-y-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {featureData.map((feature, index) => (
              <Card
                key={index}
                className="w-[320px] flex-none gradient-pink-dark-reverse border-none"
              >
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <div>
                      <h2 className="text-xl">{feature.featureName}</h2>
                    </div>
                    <p className="text-sm text-foreground">
                      {feature.featureDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {featureData.length > 0 && (
            <div className="mt-4">
              <CsvDownloadButton features={featureData} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
