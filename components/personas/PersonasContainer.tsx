'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PersonaData,
  JourneyStep,
  NUMBER_OF_PERSONA,
  TARIFFS,
} from '@/app/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'
import { CsvDownloadButton } from './CsvDownloadButton'
import { getProjectIdFromUrl } from '@/app/utils/getProjectId'
import { toast } from 'react-hot-toast'

interface PersonasContainerProps {
  journeySteps: JourneyStep[]
  onPersonasGenerated: (personas: PersonaData[]) => void
  projectId?: string // Make this optional to handle undefined cases
}

export function PersonasContainer({
  journeySteps = [],
  onPersonasGenerated,
  projectId,
}: PersonasContainerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [personaData, setPersonaData] = useState<PersonaData[]>([])

  // Add state for data fetching
  const [dataLoading, setDataLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Function to fetch existing persona data
  const fetchExistingPersonaData = useCallback(
    async (id: string) => {
      setDataLoading(true)
      try {
        console.log(`Fetching persona data for project: ${id}`)

        const response = await fetch(`/api/projects/${id}/persona-save`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          if (response.status === 404) {
            console.log(
              'No persona data found yet (404 is expected for new projects)'
            )
          } else {
            const errorText = await response.text()
            console.error(
              `Error ${response.status} fetching persona data:`,
              errorText
            )
            toast.error('Failed to load existing persona data')
          }
          return
        }

        const persona = await response.json()
        console.log('Persona data fetched successfully:', persona)

        // If we have data, populate the personas
        if (
          persona &&
          persona.personas && // Change from personaData to personas
          Array.isArray(persona.personas) &&
          persona.personas.length > 0
        ) {
          // Update local state
          setPersonaData(persona.personas as PersonaData[])

          // Call the parent component's callback
          onPersonasGenerated(persona.personas as PersonaData[])
          toast.success('Loaded your personas')
        }
      } catch (error) {
        console.error('Error fetching persona data:', error)
        toast.error('Failed to load persona data')
      } finally {
        setDataLoading(false)
      }
    },
    [onPersonasGenerated]
  )

  // Load existing data on component mount
  useEffect(() => {
    if (hasFetched) return

    const fetchData = async () => {
      let idToUse: string | null | undefined = projectId

      if (!idToUse) {
        idToUse = getProjectIdFromUrl()
      }

      if (idToUse && typeof idToUse === 'string') {
        console.log(`Using project ID for fetch: ${idToUse}`)
        await fetchExistingPersonaData(idToUse)
        setHasFetched(true)
      } else {
        console.log('No valid project ID available for fetching persona data')
        setHasFetched(true) // Mark as fetched to prevent loops
      }
    }

    fetchData()
  }, [projectId, fetchExistingPersonaData, hasFetched])

  const handleGeneratePersonas = async () => {
    setLoading(true)
    setError(null)
    try {
      // Generate personas with OpenAI
      const response = await fetch('/api/openai/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formattedPrompt: createPrompt() }),
      })

      const { data, error } = await response.json()
      if (error) throw new Error(error)

      // Update local state
      setPersonaData(data)
      onPersonasGenerated(data) // Pass data to parent

      // Save to database
      const currentProjectId = projectId || getProjectIdFromUrl()
      if (!currentProjectId) {
        console.warn('No project ID found, unable to save personas to database')
        return
      }

      // Save personas to database
      const saveResponse = await fetch(
        `/api/projects/${currentProjectId}/persona-save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personas: data,
          }),
        }
      )

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        console.error('Error saving personas:', errorText)
        toast.error('Failed to save personas')
      } else {
        console.log('Personas saved successfully to database')
        toast.success('Personas saved successfully')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate personas'
      )
      toast.error('Failed to generate personas')
    } finally {
      setLoading(false)
    }
  }

  const createPrompt = () => {
    console.log('Journey Steps:', journeySteps)

    if (!journeySteps?.length) {
      return `You are a customer experience expert. Please generate six customer personas for a company.`
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
    1. Develop exactly ${NUMBER_OF_PERSONA} customer personas with diverse needs, expectations, and preferences regarding the journey. 
    2. Include a gender for the persona {persona-gender}.
    3. Include a name {persona-name}. Represent diverse ethnicities and cultures from around the world. First names only.
    4. Include an age for the persona that is relevant to the product or service {persona-age}.
    5. Include a short description of the customer persona that is relevant to the product or service {persona-group-description}.
    6. Give the group a name {persona-group-name}.
    7. Include a scenario {persona-scenario} that has led them to use the products and services.
    8. Include a quote {persona-quote} that represents their feelings or thoughts.
    9. DO NOT include "Millennials", "Boomers", "Gen Alpha", "Gen X" or "Gen Z" as a persona.

    VERIFY BEFORE RESPONDING:
    - Have you provided exactly ${NUMBER_OF_PERSONA} personas?
    - Have you included all required fields including gender?`

    return prompt
  }

  return (
    <div className="w-full space-y-8">
      {dataLoading ? (
        <Card className="w-full p-6 border-none">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 mr-2 animate-spin" />
            <span>Loading your personas...</span>
          </div>
        </Card>
      ) : (
        <>
          {/* Form Section (Previously PersonaForm) */}
          <Card
            className={`w-full p-6 ${
              journeySteps.length === 0 ? 'bg-muted' : 'gradient-orange-yellow'
            } border-none`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Personas
                  </h2>
                  <p className="text-base text-foreground">
                    {journeySteps.length === 0
                      ? 'Create a service story first to draft personas.'
                      : 'Draft user personas to inform your research and trigger some early ideas.'}
                  </p>
                </div>
                <div>
                  <TariffRoundel cost={TARIFFS.personas} variant="small" />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleGeneratePersonas}
                disabled={loading || journeySteps.length === 0}
                className={`bg-foreground dark:text-background hover:opacity-70 transition-opacity ${
                  journeySteps.length === 0 ? 'opacity-60' : ''
                }`}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Saving you time...' : 'Draft Personas'}
              </Button>
            </div>
          </Card>

          {/* Display Section (Previously PersonaDisplay) */}
          {error && (
            <Card className="bg-red-50 p-4">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {personaData.length > 0 && (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {personaData.map((persona, index) => (
                  <Card
                    key={index}
                    className="w-full gradient-orange-yellow-reverse border-none"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="border-2 border-foreground p-3 rounded-lg">
                          <h2 className="text-2xl ">{persona.personaName}</h2>
                          <p className="text-sm">Aged {persona.personaAge}</p>
                        </div>
                        <h3 className="text-xl font-bold">
                          {persona.personaGroupName}
                        </h3>
                        <p className="text-lg">
                          {persona.personaGroupDescription}
                        </p>
                        <p className="text-base">{persona.personaScenario}</p>
                        <blockquote className="text-base italic border-l-2 border-foreground pl-2">
                          {`"${persona.personaQuote}"`}
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4">
                <CsvDownloadButton personas={personaData} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
