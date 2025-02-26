'use client'

import { useState } from 'react'
import { FeatureDisplay } from '@/components/features/FeatureDisplay'
import { FeatureForm } from '@/components/features/FeatureForm'
import {
  FeatureData,
  JourneyStep,
  CustomerPainPointData,
  BusinessPainPointData,
  NUMBER_OF_FEATURES,
  PersonaData,
} from '@/app/lib/types'
//import { ITEMS_PER_ROW } from "@/lib/types";

interface FeaturesContainerProps {
  journeySteps: JourneyStep[]
  customerPains: CustomerPainPointData[]
  businessPains: BusinessPainPointData[]
  personaData: PersonaData[] // Ensure prop is typed correctly
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

    // Format business pains with improved validation
    // const businessPainsText =
    //   businessPains?.length > 0
    //     ? businessPains
    //         .map((pain, index) => {
    //           console.log(`Processing business pain ${index}:`, pain);
    //           if (
    //             !pain ||
    //             (!pain["business-pain-1"] && !pain["business-pain-2"])
    //           ) {
    //             return null;
    //           }
    //           const points = [
    //             pain["business-pain-1"],
    //             pain["business-pain-2"],
    //           ].filter((point) => point?.trim().length > 0);

    //           return points.length > 0
    //             ? `${index + 1}. ${points.join(", ")}`
    //             : null;
    //         })
    //         .filter(Boolean)
    //         .join("\n")
    //     : "No business pain points provided";

    // Debug formatted output
    // console.log("Formatted Data:", {
    // customerPainsText,
    // businessPainsText,
    // });

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

    // console.log("Generated Prompt:", {
    //   journeySteps: stepsText,
    //   // customerPains: customerPainsText,
    //   // businessPains: businessPainsText,
    //   personaData: personaScenarioText,
    //   fullPrompt: prompt,
    // });

    return prompt
  }

  return (
    <div className="width-full">
      <div className="space-y-8">
        <FeatureForm
          onGenerate={handleGenerateFeatures}
          loading={loading}
          hasJourney={journeySteps.length > 0}
          hasCustomerPains={customerPains && customerPains.length > 0}
          hasBusinessPains={businessPains && businessPains.length > 0}
        />
        <FeatureDisplay features={featureData} error={error} />
      </div>
    </div>
  )
}
