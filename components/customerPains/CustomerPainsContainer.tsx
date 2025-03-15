'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'
import { CsvDownloadButton } from './CsvDownloadButton'
import {
  JourneyStep,
  CustomerPainPointData,
  NUMBER_OF_JOURNEY_STEPS,
  ITEMS_PER_ROW,
  TARIFFS,
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
  const itemsPerRow = ITEMS_PER_ROW
  const painPointIndices = Array.from({ length: itemsPerRow }, (_, i) => i + 1)

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
    <div className="w-full space-y-8">
      {/* Form Section (Previously CustomerPainsForm) */}
      <Card
        className={`w-full p-6 ${
          isDisabled ? 'bg-muted' : 'gradient-blue-dark'
        } border-none`}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Customer Pain Points
              </h2>
              <p className="text-base text-muted-foreground">
                {isDisabled
                  ? 'Create a service story first to identify pain points.'
                  : 'Identify likely customer pain points at each journey step.'}
              </p>
            </div>
            <div>
              <TariffRoundel cost={TARIFFS.customerPains} variant="small" />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleGenerateCustomerPains}
            disabled={loading || isDisabled}
            className={`bg-foreground dark:text-background hover:opacity-70 transition-opacity ${
              isDisabled ? 'opacity-60' : ''
            }`}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving you time...' : 'Identify Customer Pain Points'}
          </Button>
        </div>
      </Card>

      {/* Display Section (Previously CustomerPainsDisplay) */}
      {error && (
        <Card className="bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {painPoints.length > 0 && (
        <div className="mt-8">
          <div className="flex overflow-x-auto gap-4 pb-4">
            {painPoints.map((point, index) => (
              <Card
                key={index}
                className="p-4 flex-none w-[250px] gradient-blue-dark-reverse border-none"
              >
                <h3 className="font-semibold mb-4">
                  Step {index + 1}: {journeySteps[index]?.title}
                </h3>
                <div className="space-y-2">
                  {painPointIndices.map((i) => (
                    <div key={`pain-${index}-${i}`}>
                      <p className="mt-1 text-sm">
                        {point[`customer-pain-${i}` as keyof typeof point]}
                      </p>
                      {i < itemsPerRow && (
                        <hr className="border-gray-400 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <CsvDownloadButton
              painPoints={painPoints}
              journeySteps={journeySteps}
            />
          </div>
        </div>
      )}
    </div>
  )
}
