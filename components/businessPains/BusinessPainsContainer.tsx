'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'
import { CsvDownloadButton } from './CsvDownloadButton'
import { toast } from 'react-hot-toast'
import { getProjectIdFromUrl } from '@/app/utils/getProjectId'
import {
  JourneyStep,
  BusinessPainPointData,
  NUMBER_OF_JOURNEY_STEPS,
  ITEMS_PER_ROW,
  TARIFFS,
} from '@/app/lib/types'

interface BusinessPainsContainerProps {
  journeySteps: JourneyStep[]
  onBusinessPainPointsGenerated: (pains: BusinessPainPointData[]) => void
  projectId?: string // Add project ID prop
}

export function BusinessPainsContainer({
  journeySteps = [],
  onBusinessPainPointsGenerated,
  projectId,
}: BusinessPainsContainerProps) {
  const [painPoints, setPainPoints] = useState<BusinessPainPointData[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false) // For initial data loading
  const [error, setError] = useState('')
  const [hasFetched, setHasFetched] = useState(false) // Track if we've fetched data

  const isDisabled = !journeySteps.length
  const itemsPerRow = ITEMS_PER_ROW
  const painPointIndices = Array.from({ length: itemsPerRow }, (_, i) => i + 1)

  // Function to save business pains to database
  const saveBusinessPains = async (painData: BusinessPainPointData[]) => {
    try {
      const currentProjectId = projectId || getProjectIdFromUrl()

      if (!currentProjectId) {
        toast.error('No project ID found')
        return
      }

      console.log('Saving business pains for project:', currentProjectId)

      const saveResponse = await fetch(
        `/api/projects/${currentProjectId}/business-pains-save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            painPoints: painData,
          }),
        }
      )

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(
          errorData.error || 'Failed to save business pain points'
        )
      }

      toast.success('Business pain points saved successfully')
    } catch (error) {
      console.error('Error saving business pain points:', error)
      toast.error('Failed to save business pain points')
    }
  }

  // Function to fetch existing business pains
  const fetchExistingBusinessPains = useCallback(
    async (id: string) => {
      setDataLoading(true)
      try {
        const response = await fetch(`/api/projects/${id}/business-pains-save`)

        if (!response.ok) {
          throw new Error('Failed to fetch business pain points')
        }

        const data = await response.json()

        if (data && data.painPoints && Array.isArray(data.painPoints)) {
          setPainPoints(data.painPoints)
          onBusinessPainPointsGenerated(data.painPoints)
          toast.success('Loaded your business pain points')
        }
      } catch (error) {
        console.error('Error loading business pain points:', error)
        toast.error('Failed to load business pain points')
      } finally {
        setDataLoading(false)
      }
    },
    [onBusinessPainPointsGenerated]
  )

  // Fetch existing data on component mount
  useEffect(() => {
    if (hasFetched) return

    const fetchData = async () => {
      let idToUse: string | null | undefined = projectId

      if (!idToUse) {
        idToUse = getProjectIdFromUrl()
      }

      if (idToUse && typeof idToUse === 'string') {
        console.log(`Using project ID for fetch: ${idToUse}`)
        await fetchExistingBusinessPains(idToUse)
        setHasFetched(true)
      } else {
        console.log('No valid project ID available for fetching business pains')
        setHasFetched(true) // Mark as fetched to prevent loops
      }
    }

    fetchData()
  }, [projectId, fetchExistingBusinessPains, hasFetched])

  // Modified to save to database after generation
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

      if (!response.ok) {
        throw new Error('Failed to generate business pain points')
      }

      const { data } = await response.json()

      // Validate the data
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from AI service')
      }

      // Update state and notify parent
      setPainPoints(data)
      onBusinessPainPointsGenerated(data)

      // Save to database
      await saveBusinessPains(data)
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
    // Existing prompt creation logic
    if (!journeySteps?.length) {
      return `You are a business consultant. Please generate business pain points for a company.`
    }

    const stepsText = journeySteps
      .map(
        (step) =>
          `Step ${step.step}: ${step.title}\nDescription: ${step.description}`
      )
      .join('\n\n')

    const prompt = `You are a business strategy and CX consultant. Here is the customer journey: 
    
    ${stepsText}

    IMPORTANT INSTRUCTIONS:
    1. For all ${NUMBER_OF_JOURNEY_STEPS} steps in this customer journey, describe ${ITEMS_PER_ROW} potential problems the business might encounter.
    2. Maximum of 15 words per problem.
    3. ${ITEMS_PER_ROW} problems for each step. 
    4. Add a period at the end of each sentence. 
    5. Do not return a title. 
    6. Focus on operational issues, resource constraints, and competitive challenges.

    VERIFY BEFORE RESPONDING:
    - Have you covered all ${NUMBER_OF_JOURNEY_STEPS} steps? 
    - Maximum of 15 words per problem
    - There are no missing steps.
    - Have you provided exactly ${ITEMS_PER_ROW} problems per step?
    - Are all problems specific to their respective steps?`

    return prompt
  }

  return (
    <div className="w-full space-y-8">
      {/* Show loading state when fetching initial data */}
      {dataLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading business pain points...</span>
        </div>
      ) : (
        <>
          {/* Form Section */}
          <Card
            className={`w-full p-6 ${
              isDisabled ? 'bg-muted' : 'gradient-blue-dark'
            } border-none`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Business Pain Points
                  </h2>
                  <p className="text-base text-muted-foreground">
                    {isDisabled
                      ? 'Create a service story first to identify pain points.'
                      : 'Identify likely business pain points at each journey step.'}
                  </p>
                </div>
                <div>
                  <TariffRoundel cost={TARIFFS.businessPains} variant="small" />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleGenerateBusinessPains}
                disabled={loading || isDisabled}
                className={`bg-foreground dark:text-background hover:opacity-70 transition-opacity ${
                  isDisabled ? 'opacity-60' : ''
                }`}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading
                  ? 'Saving you time...'
                  : 'Identify Business Pain Points'}
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
                            {point[`business-pain-${i}` as keyof typeof point]}
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
        </>
      )}
    </div>
  )
}
