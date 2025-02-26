import OpenAI from 'openai'
import { ChatCompletion } from 'openai/resources/chat/completions'
import { NextResponse } from 'next/server'
import {
  OPENAI_MODEL,
  OPENAI_TEMP,
  OPENAI_MAX_TOKENS,
  OPENAI_TIMEOUT,
  EnablerData,
} from '@/app/lib/types'

interface RequestBody {
  formattedPrompt: string
}

interface EnablersData {
  enablers: EnablerData[]
}

type ObjectWithEnablers = {
  enablers: unknown[]
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

function isEnabler(enabler: unknown): enabler is EnablerData {
  if (!isObject(enabler)) return false

  return (
    'enablerDescription' in enabler &&
    typeof enabler.enablerDescription === 'string'
  )
}

function validateEnablers(data: unknown): data is EnablersData {
  if (!isObject(data)) {
    console.error('Data is not an object:', data)
    return false
  }
  if (!('enablers' in data)) {
    console.error('Data does not contain enablers key:', data)
    return false
  }
  const enablersData = data as ObjectWithEnablers
  if (!Array.isArray(enablersData.enablers)) {
    console.error('Enablers is not an array:', enablersData.enablers)
    return false
  }
  const isValid = enablersData.enablers.every(isEnabler)
  if (!isValid) {
    console.error('Invalid enabler in array:', enablersData.enablers)
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
            name: 'createEnablers', // Match this name
            description:
              'Create service enablers based on journey steps and business pains.',
            parameters: {
              type: 'object',
              properties: {
                enablers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      enablerName: { type: 'string' },
                      enablerDescription: { type: 'string' },
                    },
                    required: ['enablerName', 'enablerDescription'],
                  },
                },
              },
              required: ['enablers'],
            },
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: { name: 'createEnablers' }, // Match the same name here
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

    if (!validateEnablers(parsedData)) {
      throw new Error(`Invalid enablers data received from OpenAI. 
        Expected format: { enablers: Array<PersonaData> }`)
    }

    return NextResponse.json({ data: parsedData.enablers })
  } catch (error: unknown) {
    console.error('Error in enablers generation:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate enablers',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
