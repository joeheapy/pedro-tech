'use client'

import { useState } from 'react'
import { PersonaDisplay } from '@/components/personas/PersonaDisplay'
import { PersonaForm } from '@/components/personas/PersonaForm'
import { PersonaData, JourneyStep, NUMBER_OF_PERSONA } from '@/app/lib/types'

interface PersonasContainerProps {
  journeySteps: JourneyStep[]
  onPersonasGenerated: (personas: PersonaData[]) => void // Update prop type
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
    <div className="width-full">
      <div className="space-y-8">
        <PersonaForm
          onGenerate={handleGeneratePersonas}
          loading={loading}
          disabled={!journeySteps.length}
        />
        <PersonaDisplay personas={personaData} error={error} />
      </div>
    </div>
  )
}
