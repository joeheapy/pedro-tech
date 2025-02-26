'use client'

import { useState } from 'react'
import {
  JourneyStep,
  BusinessPainPointData,
  NUMBER_OF_JOURNEY_STEPS,
  ITEMS_PER_ROW,
} from '@/app/lib/types'
import { BusinessPainsForm } from './BusinessPainsForm'
import { BusinessPainsDisplay } from './BusinessPainsDisplay'

interface BusinessPainsContainerProps {
  journeySteps: JourneyStep[]
  onBusinessPainPointsGenerated: (pains: BusinessPainPointData[]) => void
}

export function BusinessPainsContainer({
  journeySteps = [],
  onBusinessPainPointsGenerated,
}: BusinessPainsContainerProps) {
  const [painPoints, setPainPoints] = useState<BusinessPainPointData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isDisabled = !journeySteps.length

  const handleGenerateBusinessPains = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/openai/business-pains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formattedPrompt: createPrompt(),
        }),
      })

      const { data } = await response.json()
      setPainPoints(data)
      onBusinessPainPointsGenerated(data) // Pass data to parent
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const createPrompt = () => {
    console.log('Journey Steps:', journeySteps)

    if (!journeySteps?.length) {
      return `You are a customer experience expert. Please analyze general business pain points.`
    }

    const stepsText = journeySteps
      .map(
        (step) =>
          `Step ${step.step}: ${step.title}\nDescription: ${step.description}`
      )
      .join('\n\n')

    console.log('Steps Text:', stepsText)

    const prompt = `You are a customer experience and customer operations expert. Here is the customer journey: 
    
    ${stepsText}

    IMPORTANT INSTRUCTIONS:
    1. For all ${NUMBER_OF_JOURNEY_STEPS} steps in this customer journey, describe ${ITEMS_PER_ROW} commercial or operational problems that often make it difficult for businesses to deliver a great customer experience. 
    2. Maxiumum of 15 words per problem.
    3. Do not mention the persona's name. 
    4. ${ITEMS_PER_ROW} problems for each step. 
    5. Add a period at the end of each sentance. 
    6. Do not return a title. 
    
    VERIFY BEFORE RESPONDING:
    - Have you covered all ${NUMBER_OF_JOURNEY_STEPS} steps? 
    - Maxiumum of 15 words per problem
    - There are no missing steps.
    - Have you provided exactly ${ITEMS_PER_ROW} problems per step?
    - Are all problems specific to their respective steps?`

    console.log('Final Prompt:', prompt)
    return prompt
  }

  return (
    <div className="width-full">
      <div className="space-y-8">
        <BusinessPainsForm
          onGenerate={handleGenerateBusinessPains}
          loading={loading}
          disabled={isDisabled}
        />
        <BusinessPainsDisplay
          painPoints={painPoints}
          error={error}
          loading={loading}
          journeySteps={journeySteps}
        />
      </div>
    </div>
  )
}
