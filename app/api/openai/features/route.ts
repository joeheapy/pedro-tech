import OpenAI from 'openai'
import { ChatCompletion } from 'openai/resources/chat/completions'
import { NextResponse } from 'next/server'
import {
  OPENAI_MODEL,
  OPENAI_TEMP,
  OPENAI_MAX_TOKENS,
  OPENAI_TIMEOUT,
  FeatureData,
} from '@/app/lib/types'

interface RequestBody {
  formattedPrompt: string
}

interface FeaturesData {
  features: FeatureData[]
}

type ObjectWithFeatures = {
  features: unknown[]
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

function isFeature(feature: unknown): feature is FeatureData {
  if (!isObject(feature)) return false

  return (
    'featureDescription' in feature &&
    typeof feature.featureDescription === 'string'
  )
}

function validateFeatures(data: unknown): data is FeaturesData {
  if (!isObject(data)) {
    console.error('Data is not an object:', data)
    return false
  }
  if (!('features' in data)) {
    console.error('Data does not contain features key:', data)
    return false
  }
  const featuresData = data as ObjectWithFeatures
  if (!Array.isArray(featuresData.features)) {
    console.error('Features is not an array:', featuresData.features)
    return false
  }
  const isValid = featuresData.features.every(isFeature)
  if (!isValid) {
    console.error('Invalid feature in array:', featuresData.features)
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
            name: 'createFeatures', // Match this name
            description:
              'Create service features based on journey steps and customer pains.',
            parameters: {
              type: 'object',
              properties: {
                features: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      featureName: { type: 'string' },
                      featureDescription: { type: 'string' },
                    },
                    required: ['featureName', 'featureDescription'],
                  },
                },
              },
              required: ['features'],
            },
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: { name: 'createFeatures' }, // Match the same name here
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

    if (!validateFeatures(parsedData)) {
      throw new Error(`Invalid features data received from OpenAI. 
        Expected format: { features: Array<PersonaData> }`)
    }

    return NextResponse.json({ data: parsedData.features })
  } catch (error: unknown) {
    console.error('Error in features generation:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate features',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
