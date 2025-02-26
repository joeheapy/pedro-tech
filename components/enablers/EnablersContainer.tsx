'use client'

import { useState } from 'react'
import { EnablerDisplay } from '@/components/enablers/EnablersDisplay'
import { EnablerForm } from '@/components/enablers/EnablersForm'
import {
  EnablerData,
  JourneyStep,
  CustomerPainPointData,
  BusinessPainPointData,
  NUMBER_OF_FEATURES,
  PersonaData,
} from '@/app/lib/types'
//import { ITEMS_PER_ROW } from "@/lib/types";

interface EnablersContainerProps {
  journeySteps: JourneyStep[]
  customerPains: CustomerPainPointData[]
  businessPains: BusinessPainPointData[]
  personaData: PersonaData[] // Ensure prop is typed correctly
  onEnablersGenerated: () => void
}

export function EnablersContainer({
  journeySteps = [],
  customerPains = [],
  businessPains = [],
  personaData = [],
  onEnablersGenerated,
}: EnablersContainerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enablerData, setEnablerData] = useState<EnablerData[]>([])

  const handleGenerateEnablers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/openai/enablers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formattedPrompt: createPrompt() }),
      })
      const { data, error } = await response.json()
      if (error) throw new Error(error)
      setEnablerData(data)
      onEnablersGenerated()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate enablers'
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
      return `You are a customer experience expert. Please generate ${NUMBER_OF_FEATURES} customer enablers for a company.`
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
    const businessPainsText =
      businessPains?.length > 0
        ? businessPains
            .map((pain, index) => {
              console.log(`Processing business pain ${index}:`, pain)
              if (
                !pain ||
                (!pain['business-pain-1'] && !pain['business-pain-2'])
              ) {
                return null
              }
              const points = [
                pain['business-pain-1'],
                pain['business-pain-2'],
              ].filter((point) => point?.trim().length > 0)

              return points.length > 0
                ? `${index + 1}. ${points.join(', ')}`
                : null
            })
            .filter(Boolean)
            .join('\n')
        : 'No business pain points provided'

    // Debug formatted output
    console.log('Formatted Data:', {
      customerPainsText,
      businessPainsText,
    })

    const prompt = `You are a creative customer operations expert specialising in delivering excellent customer experiences through people, digital tools, and data-driven enablers.
Here is the customer journey:
${stepsText}
Below is a list of problems the business seeks to address:
${businessPainsText}
IMPORTANT INSTRUCTIONS:
1. Generate exactly ${NUMBER_OF_FEATURES} innovative service enablers that creatively solve the business pain points and enhance the customer journey.
2. Each enabler idea must be described in one line ONLY.
3. Each description must be a maximum of 15 words.
4. Provide the enabler ideas as a plain list with no titles or numbering.
VERIFY BEFORE RESPONDING:
- Have you provided exactly ${NUMBER_OF_FEATURES} enabler ideas?
- Are they your best, most innovative ideas?
- Does each idea have only one line?
- Are all descriptions 15 words or fewer?
- Ensure all text is written in sentence case.`

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
        <EnablerForm
          onGenerate={handleGenerateEnablers}
          loading={loading}
          hasJourney={journeySteps.length > 0}
          hasCustomerPains={customerPains && customerPains.length > 0}
          hasBusinessPains={businessPains && businessPains.length > 0}
        />
        <EnablerDisplay enablers={enablerData} error={error} />
      </div>
    </div>
  )
}
