import OpenAI from 'openai'
import { ChatCompletion } from 'openai/resources/chat/completions'
import { NextResponse } from 'next/server'
import {
  OPENAI_MODEL,
  OPENAI_TEMP,
  OPENAI_MAX_TOKENS,
  OPENAI_TIMEOUT,
  CustomerPainPointData,
  ITEMS_PER_ROW,
} from '@/app/lib/types'

interface RequestBody {
  formattedPrompt: string
}

interface PainPointsData {
  painPoints: CustomerPainPointData[]
}

type ObjectWithPainPoints = {
  painPoints: unknown[]
}

interface ValidationError {
  error: string
  details?: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
// This function checks if the provided data is a valid customer pain point
function isPainPoint(point: unknown): point is CustomerPainPointData {
  if (!isObject(point)) return false

  const validations = Array.from(
    { length: ITEMS_PER_ROW },
    (_, i) => i + 1
  ).map(
    (i) =>
      `customer-pain-${i}` in point &&
      typeof point[`customer-pain-${i}`] === 'string'
  )

  return validations.every((validation) => validation)
}
// This function checks if the provided data is a valid pain points data object
function validatePainPoints(data: unknown): data is PainPointsData {
  if (!isObject(data)) return false
  if (!('painPoints' in data)) return false
  const painPointsData = data as ObjectWithPainPoints
  if (!Array.isArray(painPointsData.painPoints)) return false
  return painPointsData.painPoints.every(isPainPoint)
}

const createTimeoutPromise = (ms: number): Promise<never> =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI request timeout')), ms)
  )

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json<ValidationError>(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const body = (await req.json()) as RequestBody
    if (!body.formattedPrompt?.trim()) {
      return NextResponse.json<ValidationError>(
        {
          error: 'Invalid request format',
          details: 'formattedPrompt is required and cannot be empty',
        },
        { status: 400 }
      )
    }

    console.log('🤖 OpenAI Prompt:', body.formattedPrompt)

    try {
      const properties = Array.from(
        { length: ITEMS_PER_ROW },
        (_, i) => i + 1
      ).reduce(
        (acc, i) => ({
          ...acc,
          [`customer-pain-${i}`]: { type: 'string' },
        }),
        {}
      )

      const required = Array.from(
        { length: ITEMS_PER_ROW },
        (_, i) => i + 1
      ).map((i) => `customer-pain-${i}`)

      const openAiPromise = openai.chat.completions.create({
        messages: [{ role: 'user', content: body.formattedPrompt }],
        model: OPENAI_MODEL,
        temperature: OPENAI_TEMP,
        max_tokens: OPENAI_MAX_TOKENS,
        tools: [
          {
            type: 'function',
            function: {
              name: 'createPainPoints',
              description: 'Create customer pain points per journey step',
              parameters: {
                type: 'object',
                properties: {
                  painPoints: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties,
                      required,
                    },
                  },
                },
                required: ['painPoints'],
              },
            },
          },
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'createPainPoints' },
        },
      })

      const completion = await Promise.race<ChatCompletion>([
        openAiPromise,
        createTimeoutPromise(OPENAI_TIMEOUT),
      ])

      console.log(
        '📦 Raw OpenAI Response:',
        JSON.stringify(completion, null, 2)
      )

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0]
      if (!toolCall?.function?.arguments) {
        throw new Error('Invalid response format from OpenAI')
      }

      console.log('🔧 Function Arguments:', toolCall.function.arguments)

      const parsedData = JSON.parse(toolCall.function.arguments)
      console.log('✨ Parsed Data:', JSON.stringify(parsedData, null, 2))

      if (!validatePainPoints(parsedData)) {
        throw new Error('Invalid pain points format')
      }

      const { painPoints } = parsedData
      console.log(
        '🎯 Validated Pain Points:',
        JSON.stringify(painPoints, null, 2)
      )

      return NextResponse.json({ data: painPoints })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'OpenAI request timeout') {
          return NextResponse.json<ValidationError>(
            {
              error: 'Request timed out',
              details: 'The OpenAI API took too long to respond',
            },
            { status: 504 }
          )
        }
        if (error.message === 'Invalid pain points format') {
          return NextResponse.json<ValidationError>(
            {
              error: error.message,
              details: 'The response format was invalid',
            },
            { status: 422 }
          )
        }
      }
      throw error
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json<ValidationError>(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate pain points',
        details: 'Please try again',
      },
      { status: 500 }
    )
  }
}
