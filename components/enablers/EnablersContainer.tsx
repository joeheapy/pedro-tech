'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'
import { CsvDownloadButton } from './CsvDownloadButton'
import { toast } from 'react-hot-toast'
import { getProjectIdFromUrl } from '@/app/utils/getProjectId'
import {
  EnablerData,
  JourneyStep,
  CustomerPainPointData,
  BusinessPainPointData,
  NUMBER_OF_FEATURES,
  TARIFFS,
  PersonaData,
} from '@/app/lib/types'

interface EnablersContainerProps {
  journeySteps: JourneyStep[]
  customerPains: CustomerPainPointData[]
  businessPains: BusinessPainPointData[]
  personaData: PersonaData[]
  onEnablersGenerated: (enablers: EnablerData[]) => void
  projectId?: string // Add projectId prop
}

export function EnablersContainer({
  journeySteps = [],
  customerPains = [],
  businessPains = [],
  personaData = [],
  onEnablersGenerated,
  projectId,
}: EnablersContainerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enablerData, setEnablerData] = useState<EnablerData[]>([])
  const [dataLoading, setDataLoading] = useState(false) // For initial data loading
  const [hasFetched, setHasFetched] = useState(false) // Track if we've fetched data

  const hasJourney = journeySteps.length > 0
  const hasBusinessPains = businessPains && businessPains.length > 0
  const isDisabled = !hasJourney || !hasBusinessPains

  const getStatusMessage = () => {
    if (!hasJourney) return 'Create a service story first.'
    if (!hasBusinessPains) return 'Generate business pain points first.'
    return `Brainstorm ${NUMBER_OF_FEATURES} service enablers to get you started.`
  }

  // Function to save enablers to database
  const saveEnablers = async (enablersData: EnablerData[]) => {
    try {
      const currentProjectId = projectId || getProjectIdFromUrl()

      if (!currentProjectId) {
        toast.error('No project ID found')
        return
      }

      console.log('Saving enablers for project:', currentProjectId)

      const saveResponse = await fetch(
        `/api/projects/${currentProjectId}/enablers-save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enablers: enablersData,
          }),
        }
      )

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save service enablers')
      }

      toast.success('Service enablers saved successfully')
    } catch (error) {
      console.error('Error saving service enablers:', error)
      toast.error('Failed to save service enablers')
    }
  }

  // Function to fetch existing enablers
  const fetchExistingEnablers = useCallback(
    async (id: string) => {
      setDataLoading(true)
      try {
        const response = await fetch(`/api/projects/${id}/enablers-save`)

        if (!response.ok) {
          throw new Error('Failed to fetch service enablers')
        }

        const data = await response.json()

        if (data && data.enablers && Array.isArray(data.enablers)) {
          setEnablerData(data.enablers)
          onEnablersGenerated(data.enablers)
          toast.success('Loaded your service enablers')
        }
      } catch (error) {
        console.error('Error loading service enablers:', error)
        toast.error('Failed to load service enablers')
      } finally {
        setDataLoading(false)
      }
    },
    [onEnablersGenerated]
  )

  // Fetch existing data on component mount
  useEffect(() => {
    if (hasFetched) return

    const fetchData = async () => {
      // First try using the prop, then fall back to URL
      let idToUse: string | null | undefined = projectId

      if (!idToUse) {
        idToUse = getProjectIdFromUrl()
      }

      if (idToUse && typeof idToUse === 'string') {
        console.log(`Using project ID for fetch: ${idToUse}`)
        await fetchExistingEnablers(idToUse)
        setHasFetched(true)
      } else {
        console.log(
          'No valid project ID available for fetching service enablers'
        )
        setHasFetched(true) // Mark as fetched to prevent loops
      }
    }

    fetchData()
  }, [projectId, fetchExistingEnablers, hasFetched])

  // Modified to save to database after generation
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
      onEnablersGenerated(data)

      // Save to database
      await saveEnablers(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate enablers'
      )
    } finally {
      setLoading(false)
    }
  }

  // Your existing createPrompt function
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

    return prompt
  }

  return (
    <div className="w-full space-y-8">
      {dataLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading service enablers...</span>
        </div>
      ) : (
        <>
          {/* Form Section */}
          <Card
            className={`w-full p-6 ${
              isDisabled ? 'bg-muted' : 'gradient-pink-dark'
            } border-none`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Service Enablers
                  </h2>
                  <p className="text-base text-muted-foreground">
                    {getStatusMessage()}
                  </p>
                </div>
                <div>
                  <TariffRoundel cost={TARIFFS.enablers} variant="small" />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleGenerateEnablers}
                disabled={loading || isDisabled}
                className={`bg-foreground dark:text-background hover:opacity-70 transition-opacity ${
                  isDisabled ? 'opacity-60' : ''
                }`}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Saving you time...' : 'Identify Service Enablers'}
              </Button>
            </div>
          </Card>

          {/* Display Section */}
          {error && (
            <Card className="bg-red-50 p-4">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {enablerData.length > 0 && (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {enablerData.map((enabler, index) => (
                  <Card
                    key={index}
                    className="w-[340px] flex-none gradient-pink-dark-reverse border-none"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <div>
                          <h2 className="text-xl">{enabler.enablerName}</h2>
                        </div>
                        <p className="text-sm text-foreground">
                          {enabler.enablerDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {enablerData.length > 0 && (
                <div className="mt-4">
                  <CsvDownloadButton enablers={enablerData} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
