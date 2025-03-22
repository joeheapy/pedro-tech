'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'
import { CsvDownloadButton } from './CsvDownloadButton'
import { toast } from 'react-hot-toast'
import {
  JourneyStep,
  CustomerPainPointData,
  NUMBER_OF_JOURNEY_STEPS,
  ITEMS_PER_ROW,
  TARIFFS,
} from '@/app/lib/types'
import { getProjectIdFromUrl } from '@/app/utils/getProjectId'

interface CustomerPainsContainerProps {
  journeySteps: JourneyStep[]
  onCustomerPainPointsGenerated: (pains: CustomerPainPointData[]) => void // IMPORTANT: Expects ARRAY
  projectId?: string
}

export function CustomerPainsContainer({
  journeySteps = [],
  onCustomerPainPointsGenerated,
  projectId,
}: CustomerPainsContainerProps) {
  const [painPoints, setPainPoints] = useState<CustomerPainPointData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

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
      const painPointsArray = Array.isArray(data) ? data : [data]

      setPainPoints(painPointsArray)
      onCustomerPainPointsGenerated(painPointsArray) // Pass as array

      // Save to database
      await saveCustomerPains(painPointsArray)
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

  const saveCustomerPains = async (painData: CustomerPainPointData[]) => {
    try {
      const currentProjectId = projectId || getProjectIdFromUrl()

      if (!currentProjectId) {
        toast.error('No project ID found')
        return
      }

      console.log('Saving customer pains for project:', currentProjectId)

      const saveResponse = await fetch(
        `/api/projects/${currentProjectId}/customer-pains-save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            painPoints: painData, // Pass the array (API handles both)
          }),
        }
      )

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(
          errorData.error || 'Failed to save customer pain points'
        )
      }

      toast.success('Customer pain points saved successfully')
    } catch (error) {
      console.error('Error saving customer pain points:', error)
      toast.error('Failed to save customer pain points')
    }
  }

  const fetchExistingCustomerPains = useCallback(
    async (id: string) => {
      setDataLoading(true)
      try {
        const response = await fetch(`/api/projects/${id}/customer-pains-save`)
        const data = await response.json()

        if (data && data.painPoints && Array.isArray(data.painPoints)) {
          setPainPoints(data.painPoints)
          onCustomerPainPointsGenerated(data.painPoints)
          toast.success('Loaded your customer pain points')
        }
      } catch (error) {
        console.error('Error loading customer pain points:', error)
      } finally {
        setDataLoading(false)
      }
    },
    [onCustomerPainPointsGenerated]
  )

  useEffect(() => {
    if (hasFetched) return

    const fetchData = async () => {
      let idToUse: string | null | undefined = projectId

      if (!idToUse) {
        idToUse = getProjectIdFromUrl()
      }

      if (idToUse && typeof idToUse === 'string') {
        console.log(`Using project ID for fetch: ${idToUse}`)
        await fetchExistingCustomerPains(idToUse)
        setHasFetched(true)
      } else {
        console.log('No valid project ID available for fetching customer pains')
        setHasFetched(true) // Mark as fetched to prevent loops
      }
    }

    fetchData()
  }, [projectId, fetchExistingCustomerPains, hasFetched])

  return (
    <div className="w-full space-y-8">
      {dataLoading ? (
        // Add this loading indicator for initial data fetch
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading pain points...</span>
        </div>
      ) : (
        <>
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
                {loading
                  ? 'Saving you time...'
                  : 'Identify Customer Pain Points'}
              </Button>
            </div>
          </Card>

          {/* Display Section */}
          {error && (
            <Card className="bg-red-50 p-4">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {painPoints.length > 0 && (
            <div className="mt-8">
              <div className="flex overflow-x-auto gap-4 pb-4">
                {journeySteps.map((step, index) => {
                  // Only render if we have pain points for this step
                  const point = painPoints[index]
                  if (!point) return null

                  return (
                    <Card
                      key={index}
                      className="p-4 flex-none w-[250px] gradient-blue-dark-reverse border-none"
                    >
                      <h3 className="font-semibold mb-4">
                        Step {index + 1}: {step.title}
                      </h3>
                      <div className="space-y-2">
                        {painPointIndices.map((i) => {
                          const key = `customer-pain-${i}` as keyof typeof point
                          return (
                            <div key={`pain-${index}-${i}`}>
                              <p className="mt-1 text-sm">{point[key]}</p>
                              {i < itemsPerRow && (
                                <hr className="border-gray-400 mt-2" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )
                })}
              </div>
              <div className="flex justify-center mt-4">
                <CsvDownloadButton
                  painPoints={painPoints}
                  journeySteps={journeySteps}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
