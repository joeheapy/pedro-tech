'use client'

import { useState } from 'react'
import { CustomerPainsForm } from '@/components/customerPains/CustomerPainsForm'
import { CustomerPainsDisplay } from '@/components/customerPains/CustomerPainsDisplay'
import {
  JourneyStep,
  CustomerPainPointData,
  NUMBER_OF_JOURNEY_STEPS,
  ITEMS_PER_ROW,
} from '@/app/lib/types'

interface CustomerPainsContainerProps {
  journeySteps: JourneyStep[]
  onCustomerPainPointsGenerated: (pains: CustomerPainPointData[]) => void
}

export function CustomerPainsContainer({
  journeySteps = [],
  onCustomerPainPointsGenerated,
}: CustomerPainsContainerProps) {
  const [painPoints, setPainPoints] = useState<CustomerPainPointData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isDisabled = !journeySteps.length

  const handleGenerateCustomerPains = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/openai/customer-pains', {
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
      onCustomerPainPointsGenerated(data) // Pass data to parent
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
    if (!journeySteps?.length) {
      return `You are a customer experience expert. Please generate customer pain points for a company.`
    }

    const stepsText = journeySteps
      .map(
        (step) =>
          `Step ${step.step}: ${step.title}\nDescription: ${step.description}`
      )
      .join('\n\n')

    //console.log("Steps Text:", stepsText);

    const prompt = `You are a customer experience expert. Here is the customer journey: 
    
    ${stepsText}

    IMPORTANT INSTRUCTIONS:
    1. For all ${NUMBER_OF_JOURNEY_STEPS} steps in this customer journey, describe ${ITEMS_PER_ROW} potential problems customers might encounter.
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

    return prompt
  }

  return (
    <div className="width-full">
      <div className="space-y-8">
        <CustomerPainsForm
          onGenerate={handleGenerateCustomerPains}
          loading={loading}
          disabled={isDisabled}
        />
        <CustomerPainsDisplay
          painPoints={painPoints}
          error={error}
          loading={loading}
          journeySteps={journeySteps}
        />
      </div>
    </div>
  )
}
