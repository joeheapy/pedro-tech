'use client'

import { useState } from 'react'
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

interface PersonasContainerProps {
  journeySteps: JourneyStep[]
  onPersonasGenerated: (personas: PersonaData[]) => void
}

export function PersonasContainer({
  journeySteps = [],
  onPersonasGenerated,
}: PersonasContainerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [personaData, setPersonaData] = useState<PersonaData[]>([])

  const handleGeneratePersonas = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/openai/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formattedPrompt: createPrompt() }),
      })
      const { data, error } = await response.json()
      if (error) throw new Error(error)
      setPersonaData(data)
      onPersonasGenerated(data) // Pass data to parent
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate personas'
      )
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
              <p className="text-base text-muted-foreground">
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
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {personaData.map((persona, index) => (
              <Card
                key={index}
                className="w-[340px] flex-none gradient-orange-yellow-reverse border-none"
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
                    <p className="text-lg">{persona.personaGroupDescription}</p>
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
    </div>
  )
}
