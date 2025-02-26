import OpenAI from 'openai'
import { ChatCompletion } from 'openai/resources/chat/completions'
import { NextResponse } from 'next/server'
import {
  OPENAI_MODEL,
  OPENAI_TEMP,
  OPENAI_MAX_TOKENS,
  OPENAI_TIMEOUT,
  PersonaData,
} from '@/app/lib/types'

interface RequestBody {
  formattedPrompt: string
}

interface PersonasData {
  personas: PersonaData[]
}

type ObjectWithPersonas = {
  personas: unknown[]
}

interface ValidationError {
  error: string
  details?: string
  debug?: unknown
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidRequest(body: unknown): body is RequestBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'formattedPrompt' in body &&
    typeof body.formattedPrompt === 'string' &&
    body.formattedPrompt.trim().length > 0
  )
}

function isPersona(persona: unknown): persona is PersonaData {
  if (!isObject(persona)) return false

  return (
    'personaName' in persona &&
    typeof persona.personaName === 'string' &&
    'personaAge' in persona &&
    typeof persona.personaAge === 'number' &&
    'personaGroupName' in persona &&
    typeof persona.personaGroupName === 'string' &&
    'personaGroupDescription' in persona &&
    typeof persona.personaGroupDescription === 'string' &&
    'personaScenario' in persona &&
    typeof persona.personaScenario === 'string' &&
    'personaQuote' in persona &&
    typeof persona.personaQuote === 'string' &&
    'personaGender' in persona &&
    typeof persona.personaGender === 'string'
  )
}

function validatePersonas(data: unknown): data is PersonasData {
  if (!isObject(data)) {
    console.error('Data is not an object:', data)
    return false
  }
  if (!('personas' in data)) {
    console.error('Data does not contain personas key:', data)
    return false
  }
  const personasData = data as ObjectWithPersonas
  if (!Array.isArray(personasData.personas)) {
    console.error('Personas is not an array:', personasData.personas)
    return false
  }
  const isValid = personasData.personas.every(isPersona)
  if (!isValid) {
    console.error('Invalid persona in array:', personasData.personas)
  }
  return isValid
}

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json<ValidationError>(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const body = await req.json()
    if (!isValidRequest(body)) {
      return NextResponse.json<ValidationError>(
        {
          error: 'Invalid request format',
          details: 'formattedPrompt is required and cannot be empty',
        },
        { status: 400 }
      )
    }

    console.log('Sending prompt to OpenAI:', body.formattedPrompt)

    const openAiPromise = openai.chat.completions.create({
      messages: [{ role: 'user', content: body.formattedPrompt }],
      model: OPENAI_MODEL,
      temperature: OPENAI_TEMP,
      max_tokens: OPENAI_MAX_TOKENS,
      tools: [
        {
          type: 'function',
          function: {
            name: 'createPersonas',
            description: 'Create personas based on journey steps',
            parameters: {
              type: 'object',
              properties: {
                personas: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      personaName: { type: 'string' },
                      personaAge: { type: 'number' },
                      personaGroupName: { type: 'string' },
                      personaGroupDescription: { type: 'string' },
                      personaScenario: { type: 'string' },
                      personaQuote: { type: 'string' },
                      personaGender: { type: 'string' },
                    },
                    required: [
                      'personaName',
                      'personaAge',
                      'personaGroupName',
                      'personaGroupDescription',
                      'personaScenario',
                      'personaQuote',
                      'personaGender',
                    ],
                  },
                },
              },
              required: ['personas'],
            },
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: { name: 'createPersonas' },
      },
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('OpenAI request timeout')),
        OPENAI_TIMEOUT
      )
    )

    const completion = (await Promise.race([
      openAiPromise,
      timeoutPromise,
    ])) as ChatCompletion

    console.log('OpenAI Response:', completion)

    const functionCall = completion.choices[0]?.message?.tool_calls?.[0]
    if (!functionCall?.function?.arguments) {
      throw new Error('Invalid response format from OpenAI')
    }

    console.log('Function Arguments:', functionCall.function.arguments)

    const parsedData = JSON.parse(functionCall.function.arguments)
    console.log('Parsed Data:', parsedData)

    if (!validatePersonas(parsedData)) {
      throw new Error(`Invalid personas data received from OpenAI. 
        Expected format: { personas: Array<PersonaData> }`)
    }

    return NextResponse.json({ data: parsedData.personas })
  } catch (error: unknown) {
    console.error('Error in personas generation:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate personas',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
